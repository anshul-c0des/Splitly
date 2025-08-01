"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import React, { useEffect, useState } from 'react'

const CategorySelector = ({categories, onChange}) => {
  const [selectedCategory, setSelectedCategory] = useState("")
  
  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    if(onChange && categoryId !== selectedCategory){
        onChange(categoryId);
    }
  }

  if(!categories || categories.length === 0){
    return <div>No categories available</div>
  }

  useEffect(() => {
    if(!selectedCategory && categories.length>0){
        const defaultCategory = categories.find((c)=> c.isDefault) || categories[0];
        setTimeout(()=> {
            setSelectedCategory(defaultCategory.id);
            if(onChange){
                onChange(defaultCategory.id);
            }
        }, 0)
      }
  }, [])

  

  return (
    <Select value={selectedCategory} onValueChange={handleCategoryChange} >
        <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a category" />
        </SelectTrigger>
        <SelectContent>
            {categories.map((category)=> (
                <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                        <span>{category.name}</span>
                    </div>
                </SelectItem>
            ))}
        </SelectContent>
    </Select>
  )
}

export default CategorySelector
