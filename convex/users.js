import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";

export const store = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Called storeUser without authentication present");
    }

    // Check if we've already stored this identity before.
    // Note: If you don't want to define an index right away, you can use
    // ctx.db.query("users")
    //  .filter(q => q.eq(q.field("tokenIdentifier"), identity.tokenIdentifier))
    //  .unique();
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.userId),
      )
      .unique();

      let name = identity.fullName;
      if (!name) {
        name = `${identity.firstName ?? ""} ${identity.lastName ?? ""}`.trim();
      }
      if (!name) {
        name = "Anonymous";
      }
      const email = identity.emailAddresses?.[0]?.emailAddress ?? "unknown@example.com";
      const imageUrl = identity.profileImageUrl ?? null;
    if (user !== null) {
      // If we've seen this identity before but the name has changed, patch the value.
      const patchData = {};
      if (user.name !== name) patchData.name = name;
      if (user.email !== email) patchData.email = email;
      if (user.imageUrl !== imageUrl) patchData.imageUrl = imageUrl;

      if (Object.keys(patchData).length > 0) {
        await ctx.db.patch(user._id, patchData);
      }
      return user._id;
    }
    // If it's a new identity, create a new `User`.
    return await ctx.db.insert("users", {
      name,
      email,
      tokenIdentifier: identity.userId,
      imageUrl,
    });
  },
});

export const getCurrentUser = query({
  handler: async(ctx)=>{
    const identity = await ctx.auth.getUserIdentity();
    if(!identity){
      throw new Error("Not authenticated");
    }

    const user = await ctx.db.query("users").withIndex("by_token",(q)=>
      q.eq("tokenIdentifier", identity.tokenIdentifier)
    ).first();
    if(!user){
      throw new Error("User not found");
    }

    return user
  }
})

export const searchUsers = query({
  args: {query: v.string()},
  handler: async(ctx, args)=>{
    const currentUser = await ctx.runQuery(internal.users.getCurrentUser);

    if(args.query.length <2){
      return[];
    }

    const nameResults = await ctx.db.query("users").withSearchIndex("search_name", (q)=>q.search("name", args.query)).collect();

    const emailResults = await ctx.db.query("users").withSearchIndex("search_email", (q)=>q.search("email", args.query)).collect();

    const users = [...nameResults, ...emailResults.filter((email)=> !nameResults.some((name) => name.id === email.id))];

    return users.filter((user)=>user._id !== currentUser._id).map((user)=>({
      id: user._id,
      name: user.name,
      email: user.email,
      imageUrl: user.imageUrl
    }))
  }
})