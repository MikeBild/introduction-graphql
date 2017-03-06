const fs = require('fs');
const path = require('path');
const graphqlTools = require('graphql-tools');
const definition = fs.readFileSync(path.join(__dirname, 'schema.graphql'));

module.exports = graphqlTools.makeExecutableSchema({
  typeDefs: definition.toString(),
  resolvers: resolve(),
});

function resolve () {
    return resolvers = {
        Author: {
            id: (parent, args, ctx, info) => parent.id,
            name: (parent, args, ctx, info) => parent.name,
            posts: (parent, args, ctx, info) => ctx.loaders.posts.loadQuery({authorId: parent.id}),
        },
        Post: {
            id: (parent, args, ctx, info) => parent.id,
            title: (parent, args, ctx, info) => parent.title,
            text: (parent, args, ctx, info) => parent.text,
            author: (parent, args, ctx, info) => ctx.loaders.authors.load(parent.authorId),
        },
        Query: {
            author: (parent, args, ctx, info) => ctx.loaders.authors.load(args.id),
            allAuthors: (parent, args, ctx, info) => ctx.loaders.authors.loadMany(),
            post: (parent, args, ctx, info) => ctx.loaders.posts.load(args.id),
            allPosts: (parent, args, ctx, info) => ctx.loaders.posts.loadMany(),
            me: (parent, args, ctx, info) => {
                if(!ctx.user) return;
                if((ctx.user || {}).id !== 'demo@domain.local') return;
                return resolvers.Me;
            },
        },
        Mutation: {
            upsertAuthor: (parent, args, ctx, info) => ctx.loaders.authors.upsert(args.input),
            removeAuthor: (parent, args, ctx, info) => ctx.loaders.authors.remove(args.input),
            upsertPost: (parent, args, ctx, info) => ctx.loaders.posts.upsert(args.input),
            removePost: (parent, args, ctx, info) => ctx.loaders.posts.remove(args.input),
        },
        User: {
            id: (parent, args, ctx, info) => parent.id,
        },
        Me: {
            user: (parent, args, ctx, info) => ctx.user,
            author: (parent, args, ctx, info) => resolvers.Query.author(parent, args, ctx, info),
            allAuthors: (parent, args, ctx, info) => resolvers.Query.allAuthors(parent, args, ctx, info),
        },
        Subscription: {
            upsertedAuthor: (parent, args, ctx, info) => ctx.loaders.load(parent.id || args.id),
            removedAuthor: (parent, args, ctx, info) => parent.id || args.id,
            upsertedPost: (parent, args, ctx, info) =>  ctx.loaders.load(parent.id || args.id),
            removedPost: (parent, args, ctx, info) => parent.id || args.id,            
        }
    };
}
