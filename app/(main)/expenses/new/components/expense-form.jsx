"use client"

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { api } from '@/convex/_generated/api'
import { useConvexMutation, useConvexQuery } from '@/hooks/use-convex-query'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { Calendar1Icon, CalendarIcon } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import z, {optional} from 'zod'
import CategorySelector from './category-selector'
import GroupSelector from './group-selector'
import ParticipantSelector from './participant-selector'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import SplitSelector from './split-selector'
import { getAllCategories } from '@/lib/expense-categories'
import { toast } from 'sonner'

const expenseSchema = z.object({
    description: z.string().min(1, "Description is required"),
    amount: z.string().min(1, "Amount is required").refine((val) => 
        !isNaN(parseFloat(val) && parseFloat(val)>0, {
            message: "Amount cannot be less than zero"
        })
    ),
    category: z.string().optional(),
    date: z.date(),
    paidByUserId: z.string().min(1, "Payer is required"),
    splitType: z.enum(["equal", "peercentage", "exact"]),
    groupId: z.string().optional()
})

const ExpenseForm = ({type, onSuccess}) => {
  const [participants, setParticipants] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [splits, setSplits] = useState([]);

  const {data: currentUser} = useConvexQuery(api.users.getCurrentUser);

  const createExpense = useConvexMutation(api.expenses.createExpense);
  const categories = getAllCategories ();

  const { register, handleSubmit, setValue, watch, reset, formState:{errors, isSubmitting}} = useForm({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
        description: "",
        amount:"",
        category: "",
        date: new Date(),
        paidByUserId: currentUser?._id || "",
        splitType: "equal",
        groupId: undefined
    }
  })

  const amountValue = watch("amount");
  const paidByUserId = watch("paidByUserId");

  const onSubmit = async(data) => {
    try {
        const amount = parseFloat(data.amount);

        const formattedSplits = splits.map((s) => ({
            userId: s.userId,
            amount: s.amount,
            paid: s.userId=== data.paidByUserId
        }));

        const totalSplitAmount = formattedSplits.reduce(
            (sum, split) => sum +split.amount,
            0
        );

        const tolerance = 0.01;

        if(Math.abs(totalSplitAmount-amount) > tolerance){
            toast.error(`Split amounts don't add upto total, please adjust your splits.`);
            return;
        }

        const groupId = type === 'individual' ? undefined : data.groupId;

        await createExpense.mutate({
            description: data.description,
            amount: amount,
            category: data.category | "Other",
            data: data.date.getTime(),
            paidByUserId: data.paidByUserId,
            splitType: data.splitType,
            splits: formattedSplits,
            groupId
        });

        toast.success("Expense created successfully");
        reset();

        const otherParticipant = participants.find((p)=> p.id !== currentUser._id);
        const otherUserId = otherParticipant?.id;

        onSuccess(type === 'individual'? otherUserId : groupId)
    } catch (error) {
        toast.error("Failed to create expense: "+error.message)
    }
  }

    useEffect(() => {
    if(participants.length === 0 && currentUser){
        setParticipants([
            {
                id: currentUser._id,
                name: currentUser.name,
                email: currentUser.email,
                imageUrl: currentUser.imageUrl
            }
        ])
    }
    }, [currentUser, participants])

  if(!currentUser) return null;

  return (
    <form className='space-y-6' onSubmit={handleSubmit(onSubmit)}>
      <div className='space-y-4'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                id="description"
                placeholder="Lunch, movie, shopping etc."
                {...register("description")}
                />
                {errors.description && (
                <p className="text-sm text-red-500">{errors.description.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                id="amount"
                placeholder="0.00"
                type="number"
                step="0.01"
                min="0.01"
                {...register("amount")}
                />
                {errors.amount && (
                <p className="text-sm text-red-500">{errors.amount.message}</p>
                )}
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className='space-y-2'>
                <Label htmlFor="category">Category</Label>
                <CategorySelector categories={categories || []} onChange={(categoryId) => {
                    if(categoryId) {
                        setValue("category", categoryId);
                    }
                }} />
            </div>

            <div className="space-y-2">
                <Label>Date</Label>

                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant='outline' className={cn(
                            "w-full justify-start text-left font-normal",
                            !selectedDate && "text-muted-foreground"
                        )}>
                            <CalendarIcon className='mr-2 h-4 w-4' />
                            {selectedDate ? (
                                format(selectedDate, "PPP")
                            ) : (
                                <span>Pick a date</span>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className='w-auto p-0'>
                    <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date)=>{
                            setSelectedDate(date);
                            setValue("date", date); 
                        }}
                        className="rounded-lg border"
                    />
                    </PopoverContent>
                </Popover>
            </div>
        </div>

        {type === 'group' && (
            <div className='space-y-2'>  
                <Label>Group</Label>
                <GroupSelector onChange={(group)=>{
                    if(!selectedGroup || selectedGroup.id !== group.id){
                        setSelectedGroup(group);
                        setValue("groupId", group.id);

                        if(group.members && Array.isArray(group.members)){
                            setParticipants(group.members)
                        }
                    }
                }} />

                {!selectedGroup && (
                    <p className='text-sm text-amber-600'>Please select a group to continue</p>
                )}
            </div>
        )}
        
        {type === 'individual' && (
            <div className='space-y-2'>  
                <Label>Participants</Label>
                <ParticipantSelector participants={participants} onParticipantsChange={setParticipants} />

                {participants.length <= 1 && (
                    <p className='text-sm text-amber-600'>Please add at least one other person</p>
                )}
            </div>
        )}

        <div className='space-y-2'>  
            <Label>Paid by</Label>

            <select {...register("paidByUserId")} className='w-full rounded-md border border-input bg-background px-3 py-2 text-sm'>
                <option value="">Select who paid</option>
                {participants.map((participant)=> (
                    <option key={participant.id} value={participant.id}>
                        {participant.id === currentUser._id ? "You" : participant.name}
                    </option>
                ))}
            </select>

            {errors.paidByUserId && (
                <p className='text-sm text-red-500'>{errors.paidByUserId.message}</p>
            )}
        </div>

        <div className='space-y-2'>  
            <Label>Split type</Label>

            <Tabs defaultValue="equal" onValueChange={(value)=> setValue("splitType", value)}>
                <TabsList className='w-full grid grid-cols-3'>
                    <TabsTrigger value="equal">Equal</TabsTrigger>
                    <TabsTrigger value="percentage">Percentage</TabsTrigger>
                    <TabsTrigger value="exact">Exact Amounts</TabsTrigger>
                </TabsList>
                <TabsContent value="equal" className='pt-4'>
                    <p className='text-sm text-muted-foreground'>Split equally among all participants</p>
                    <SplitSelector type="equal" amount={parseFloat(amountValue) || 0} participants={participants} paidByUserId={paidByUserId} onSplitsChange={setSplits} />
                </TabsContent>
                <TabsContent value="percentage" className='pt-4'>
                    <p className='text-sm text-muted-foreground'>Split by percentage</p>
                    <SplitSelector type="percentage" amount={parseFloat(amountValue) || 0} participants={participants} paidByUserId={paidByUserId} onSplitsChange={setSplits}/>
                </TabsContent>
                <TabsContent value="exact" className='pt-4'>
                    <p className='text-sm text-muted-foreground'>Enter exact amounts</p>
                    <SplitSelector type="exact" amount={parseFloat(amountValue) || 0} participants={participants} paidByUserId={paidByUserId} onSplitsChange={setSplits}/>
                </TabsContent>
            </Tabs>

        </div>
      </div>

      
      <div className="flex justify-end">
        <Button type='submit' disabled={isSubmitting || participants.length <=1}>
            {isSubmitting ? "Adding...    " : "Add expense"}
        </Button>
      </div>

    </form>
  )
}

export default ExpenseForm
