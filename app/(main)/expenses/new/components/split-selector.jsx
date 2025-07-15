"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";

const SplitSelector = ({
    type,
    amount,
    participants,
    paidByUserId,
    onSplitsChange,
  }) => {const { user } = useUser();
  const [splits, setSplits] = useState([]);
  const [totalPercentage, setTotalPercentage] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  // Calculate splits when inputs change
  useEffect(() => {
    if (!amount || amount <= 0 || participants.length === 0) {
      return;
    }

    let newSplits = [];

    if (type === "equal") {
      // Equal splits
      const shareAmount = amount / participants.length;
      newSplits = participants.map((participant) => ({
        userId: participant.id,
        name: participant.name,
        email: participant.email,
        imageUrl: participant.imageUrl,
        amount: shareAmount,
        percentage: 100 / participants.length,
        paid: participant.id === paidByUserId,
      }));
    } else if (type === "percentage") {
      // Initialize percentage splits evenly
      const evenPercentage = 100 / participants.length;
      newSplits = participants.map((participant) => ({
        userId: participant.id,
        name: participant.name,
        email: participant.email,
        imageUrl: participant.imageUrl,
        amount: (amount * evenPercentage) / 100,
        percentage: evenPercentage,
        paid: participant.id === paidByUserId,
      }));
    } else if (type === "exact") {
      // Initialize exact splits evenly
      const evenAmount = amount / participants.length;
      newSplits = participants.map((participant) => ({
        userId: participant.id,
        name: participant.name,
        email: participant.email,
        imageUrl: participant.imageUrl,
        amount: evenAmount,
        percentage: (evenAmount / amount) * 100,
        paid: participant.id === paidByUserId,
      }));
    }

    setSplits(newSplits);

    // Calculate totals
    const newTotalAmount = newSplits.reduce(
      (sum, split) => sum + split.amount,
      0
    );
    const newTotalPercentage = newSplits.reduce(
      (sum, split) => sum + split.percentage,
      0
    );

    setTotalAmount(newTotalAmount);
    setTotalPercentage(newTotalPercentage);

    // Notify parent about the split changes
    if (onSplitsChange) {
      onSplitsChange(newSplits);
    }
  }, [type, amount, participants, paidByUserId, onSplitsChange]);

  // Update the percentage splits - no automatic adjustment of other values
  const updatePercentageSplit = (userId, newPercentage) => {
    const totalOtherPercentage = 100 - newPercentage;
  
    // Extract the user to update and the others
    const updatedSplits = splits.map((split) => {
      if (split.userId === userId) {
        return {
          ...split,
          percentage: newPercentage,
          amount: (amount * newPercentage) / 100,
        };
      }
      return { ...split };
    });
  
    // Calculate the sum of the other users' current percentages
    const otherUsers = updatedSplits.filter((split) => split.userId !== userId);
    const currentOtherTotal = otherUsers.reduce((sum, s) => sum + s.percentage, 0);
  
    // Recalculate and redistribute percentages for others
    const adjustedSplits = updatedSplits.map((split) => {
      if (split.userId !== userId) {
        const proportion = currentOtherTotal > 0 ? split.percentage / currentOtherTotal : 1 / otherUsers.length;
        const adjustedPercentage = proportion * totalOtherPercentage;
        return {
          ...split,
          percentage: adjustedPercentage,
          amount: (amount * adjustedPercentage) / 100,
        };
      }
      return split; // Return already updated user
    });
  
    setSplits(adjustedSplits);
  
    const newTotalAmount = adjustedSplits.reduce((sum, split) => sum + split.amount, 0);
    const newTotalPercentage = adjustedSplits.reduce((sum, split) => sum + split.percentage, 0);
  
    setTotalAmount(newTotalAmount);
    setTotalPercentage(newTotalPercentage);
  
    if (onSplitsChange) {
      onSplitsChange(adjustedSplits);
    }
  };
  

  // Update the exact amount splits - no automatic adjustment of other values
  const updateExactSplit = (userId, newAmountInput) => {
    const newAmount = parseFloat(newAmountInput) || 0;
  
    // Disallow entering an amount greater than total expense
    if (newAmount > amount) {
      // Optionally show UI error or toast here
      toast.error("Cannot add split greater than expense");
      return;
    }
  
    // Update this user's amount
    const updatedSplits = splits.map((split) => {
      if (split.userId === userId) {
        return {
          ...split,
          amount: newAmount,
        };
      }
      return { ...split };
    });
  
    const remainingAmount = amount - newAmount;
    const otherUsers = updatedSplits.filter((split) => split.userId !== userId);
    const currentOtherTotal = otherUsers.reduce((sum, s) => sum + s.amount, 0);
  
    const adjustedSplits = updatedSplits.map((split) => {
      if (split.userId !== userId) {
        const proportion = currentOtherTotal > 0 ? split.amount / currentOtherTotal : 1 / otherUsers.length;
        const adjustedAmount = remainingAmount * proportion;
        return {
          ...split,
          amount: adjustedAmount,
        };
      }
      return split;
    });
  
    const finalSplits = adjustedSplits.map((split) => ({
      ...split,
      percentage: (split.amount / amount) * 100,
    }));
  
    setSplits(finalSplits);
  
    const newTotalAmount = finalSplits.reduce((sum, split) => sum + split.amount, 0);
    const newTotalPercentage = finalSplits.reduce((sum, split) => sum + split.percentage, 0);
  
    setTotalAmount(newTotalAmount);
    setTotalPercentage(newTotalPercentage);
  
    if (onSplitsChange) {
      onSplitsChange(finalSplits);
    }
  };
  
  

  // Check if totals are valid
  const isPercentageValid = Math.abs(totalPercentage - 100) < 0.01;
  const isAmountValid = Math.abs(totalAmount - amount) < 0.01;

  return (
    <div className="space-y-4 mt-4">
      {splits.map((split) => (
        <div
          key={split.userId}
          className="flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-2 min-w-[120px]">
            <Avatar className="h-7 w-7">
              <AvatarImage src={split.imageUrl} />
              <AvatarFallback>{split.name?.charAt(0) || "?"}</AvatarFallback>
            </Avatar>
            <span className="text-sm">
              {split.userId === user?.id ? "You" : split.name}
            </span>
          </div>

          {type === "equal" && (
            <div className="text-right text-sm">
              ${split.amount.toFixed(2)} ({split.percentage.toFixed(1)}%)
            </div>
          )}

          {type === "percentage" && (
            <div className="flex items-center gap-4 flex-1">
              <Slider
                value={[split.percentage]}
                min={0}
                max={100}
                step={1}
                onValueChange={(values) =>
                  updatePercentageSplit(split.userId, values[0])
                }
                className="flex-1"
              />
              <div className="flex gap-1 items-center min-w-[100px]">
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={split.percentage.toFixed(1)}
                  onChange={(e) =>
                    updatePercentageSplit(
                      split.userId,
                      parseFloat(e.target.value) || 0
                    )
                  }
                  className="w-16 h-8"
                />
                <span className="text-sm text-muted-foreground">%</span>
                <span className="text-sm ml-1">${split.amount.toFixed(2)}</span>
              </div>
            </div>
          )}

          {type === "exact" && (
            <div className="flex items-center gap-2 flex-1">
              <div className="flex-1"></div>
              <div className="flex gap-1 items-center">
                <span className="text-sm text-muted-foreground">$</span>
                <Input
                  type="number"
                  min="0"
                  max={amount * 2} // Allow values even higher than total for flexibility
                  step="0.01"
                  value={split.amount.toFixed(2)}
                  onChange={(e) =>
                    updateExactSplit(split.userId, e.target.value)
                  }
                  className="w-24 h-8"
                />
                <span className="text-sm text-muted-foreground ml-1">
                  ({split.percentage.toFixed(1)}%)
                </span>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Total row */}
      <div className="flex justify-between border-t pt-3 mt-3">
        <span className="font-medium">Total</span>
        <div className="text-right">
          <span
            className={`font-medium ${!isAmountValid ? "text-amber-600" : ""}`}
          >
            ${totalAmount.toFixed(2)}
          </span>
          {type !== "equal" && (
            <span
              className={`text-sm ml-2 ${!isPercentageValid ? "text-amber-600" : ""}`}
            >
              ({totalPercentage.toFixed(1)}%)
            </span>
          )}
        </div>
      </div>

      {/* Validation warnings */}
      {type === "percentage" && !isPercentageValid && (
        <div className="text-sm text-amber-600 mt-2">
          The percentages should add up to 100%.
        </div>
      )}

      {type === "exact" && !isAmountValid && (
        <div className="text-sm text-amber-600 mt-2">
          The sum of all splits (${totalAmount.toFixed(2)}) should equal the
          total amount (${amount.toFixed(2)}).
        </div>
      )}
    </div>
  );
}

export default SplitSelector
