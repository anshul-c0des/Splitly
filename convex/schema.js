import {defineSchema, defineTable} from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
    users: defineTable({    // main user schema
        name: v.string(),
        email: v.string(),
        tokenIdentifier: v.string(),
        imageUrl: v.optional(v.string()),
    })
    .index("by_token", ["tokenIdentifier"])
    .index("by_email", ["email"])
    .searchIndex("search_name", {searchField: "name"})
    .searchIndex("search_email", {searchField: "email"}),

    expenses: defineTable({  // expenses schema
        description: v.string(),
        amount: v.number(),
        category: v.optional(v.string()),
        date: v.number(),  // timestamps
        paidByUserId: v.id("users"),  // fetched from users
        splitType: v.string(),  
        splits: v.array(
            v.object({
                userId: v.id("users"),
                amount: v.number(),
                paid: v.boolean(),
            })
        ),
        groupId: v.optional(v.id("groups")),  // undefined for individual expenses
        createdBy: v.id("users"),
    })
    .index("by_group", ["groupId"])
    .index("by_user_and_group", ["paidByUserId", "groupId"])
    .index("by_date", ["date"]),

    groups: defineTable({
        name: v.string(),
        description: v.optional(v.string()),
        createdBy: v.id("users"),
        members: v.array(
            v.object({
                userId: v.id("users"),
                role: v.string(),  // owner or member
                joinedAt: v.number()
            })
        ),
    }),

    settlements: defineTable({
        amount: v.number(),
        note: v.optional(v.string()),
        date: v.number(),
        paidByUserId: v.id("users"),
        receivedByUserId: v.id("users"),
        groupId: v.optional(v.id("groups")),
        relatedExpenseIds: v.optional(v.array(v.id("expenses"))),
        createdBy: v.id("users"),
    })
    .index("by_group", ["groupId"])
    .index("by_user_and_group", ["paidByUserId", "groupId"])
    .index("by_receiver_and_group", ["receivedByUserId", "groupId"])
    .index("by_date", ["date"]),

})