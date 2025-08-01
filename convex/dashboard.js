import { internal } from "./_generated/api";
import { query } from "./_generated/server";


// Get User Balanced: Spending this month and year
export const getUserBalances = query({
    handler:async(ctx) =>{
        const user = await ctx.runQuery(internal.users.getCurrentUser);

        //  1-to-1 expenses
        const expenses = (await ctx.db.query("expenses").collect()).filter((e)=> !e.groupId &&
        e.paidByUserId === user._id || e.splits.some((s)=> s.userId===user._id) 
        );

        let youOwe = 0;
        let youAreOwed = 0;
        const balanceByUser = {};

        for(const e of expenses){
            const isPayer = e.paidByUserId===user._id;
            const mySplit = e.splits.find((s)=>s.userId === user._id);

            if(isPayer){
                for(const s of e.splits){
                    if(s.userId===user._id || s.paid) continue; // skips own's splits and already paid splits

                    youAreOwed += s.amount;

                    (balanceByUser[s.userId] ??= {owed: 0, owing: 0}).owed += s.amount;
                }
            }else if(mySplit || !mySplit.paid){
                youOwe += mySplit.amount;  // somwone else has paid and user have their split

                (balanceByUser[e.paidByUserId] ??= {owed: 0, owing: 0}).owing += mySplit.amount;
            }
        }

        // 1-to-1 Settlements
        const settlements = (await ctx.db.query("settlements").collect()).filter(
            (s)=>
                !s.groupId &&
                (s.paidByUserId===user._id || s.receivedByUserId===user._id)
        );

        for(const s of settlements){
            if(s.paidByUserId===user._id){
                // user paid someone -> reduces owing of user
                youOwe -= s.amount;
                (balanceByUser[s.receivedByUserId] ??= {owed:0, owing:0}).owing -=s.amount;
            }else{
                // someone paid user -> reduces owed to user
                youAreOwed -=s.amount;
                (balanceByUser[s.paidByUserId] ??= {owed:0, owing:0}).owed -=s.amount;
            }
        }

        const youOweList = [];
        const youAreOwedByList = [];

        for(const [uid, {owed, owing}] of Object.entries(balanceByUser)){
            const net = owed-owing; // net amount
            if(net===0) continue;

            const counterPart = await ctx.db.get(uid);
            const base ={
                userId: uid,
                name: counterPart?.name?? "Unknown",
                imageUrl: counterPart?.imageUrl,
                amount: Math.abs(net) 
            };

            net>0 ? youAreOwedByList.push(base) : youOweList.push(base);
        }

        youOweList.sort((a,b) => b.amount - a.amount);  
        youAreOwedByList.sort((a,b) => b.amount - a.amount);

        return {
            youOwe, youAreOwed, // amount user owe and owed to user
            totalBalance: youAreOwed - youOwe, // net balance
            oweDetails: {youOwe: youOweList, youAreOwedBy: youAreOwedByList} // details
        }
    }
});

export const getTotalSpent = query({
    handler: async(ctx)=>{
        const user = await ctx.runQuery(internal.users.getCurrentUser);

        const currentYear = new Date().getFullYear();
        const startOfYear = new Date(currentYear, 0, 1).getTime();

        const expenses = await ctx.db.query("expenses").withIndex("by_date", (q)=>q.gte("date", startOfYear)).collect();

        const userExpenses = expenses.filter(
            (expense) =>
                expense.paidByUserId === user._id || 
                expense.splits.some((s)=> s.userId===user._id)
        )

        let totalSpent = 0;

        userExpenses.forEach(expense => {
            const userSplit = expense.splits.find((s)=> s.userId===user._id);

            if(userSplit){
                totalSpent += userSplit.amount
            }
        });

        return totalSpent;
    }
})

export const getMonthlySpending = query({
    handler: async(ctx) =>{
        const user = await ctx.runQuery(internal.users.getCurrentUser);

        const currentYear = new Date().getFullYear();
        const startOfYear = new Date(currentYear, 0, 1).getTime();

        const allExpenses = await ctx.db.query("expenses").withIndex("by_date", (q)=> q.gte("date", startOfYear)).collect();

        const userExpenses = allExpenses.filter(
            (expense) =>
                expense.paidByUserId === user._id || 
                expense.splits.some((s)=> s.userId===user._id)
        )

        const monthlyTotals = {};

        for(let i=0; i<12; i++){
            const monthDate = new Date(currentYear, i, 1);
            monthlyTotals[monthDate.getTime()] = 0
        }

        userExpenses.forEach(expense=>{
            const date = new Date(expense.date);

            const monthStart = new Date(date.getFullYear(), date.getMonth()).getTime();

            const userSplit = expense.splits.find((s)=> s.userId===user._id);

            if(userSplit){
                monthlyTotals[monthStart] = (monthlyTotals[monthStart] ||0) + userSplit.amount;
            }
        })

        const result = Object.entries(monthlyTotals).map(([month, total ])=>({
            month: parseInt(month),
            total,
        }));

        result.sort((a,b)=> a.month - b.month);

        return result;
    }
})

export const getUserGroups = query({
    handler: async(ctx) =>{
        const user = await ctx.runQuery(internal.users.getCurrentUser);

        const allGroups = await ctx.db.query("groups").collect();

        const groups = allGroups.filter((group)=>
        group.members.some((member)=>member.userId===user._id));

        const enhancedGroups = await Promise.all(
            groups.map(async(group)=>{
                const expenses = await ctx.db.query("expenses").withIndex("by_group", (q)=> q.eq("groupId", group._id)).collect()

                let balance = 0;
                expenses.forEach((expense)=>{
                    if(expense.paidByUserId===user._id){
                        expense.splits.forEach((split)=>{
                            if(split.userId !== user._id && !split.paid){
                                balance += split.amount;
                            }
                        });
                    }else{
                        const userSplit = expense.splits.find((s)=> s.userId===user._id);
                        if(userSplit && !userSplit.paid){
                            balance -= userSplit.amount;
                        }
                    }
                });

                const settlements = await ctx.db.query("settlements").filter((q)=>
                    q.and(
                        q.eq(q.field("groupId"), group._id),
                        q.or(
                            q.eq(q.field("paidByUserId"), user._id),
                            q.eq(q.field("receivedByUserId"), user._id),
                        )
                    )
                ).collect()

                settlements.forEach((settlement)=>{
                    if(settlement.paidByUserId===user._id){
                        balance += settlement.amount;
                    }else{
                        balance -= settlement.amount;
                    }
                });

                return {
                    ...group,
                    id:group._id,
                    balance
                }
            })
        )

        return enhancedGroups;
    }
})