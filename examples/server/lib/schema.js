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
            id: (source, args, context, info) => source.id,
            name: (source, args, context, info) => source.name,
            posts: (source, args, context, info) => context.loaders.posts.loadQuery({ authorId: source.id }, args.skip, args.limit),
        },
        Post: {
            id: (source, args, context, info) => source.id,
            title: (source, args, context, info) => source.title,
            text: (source, args, context, info) => source.text,
            author: (source, args, context, info) => context.loaders.authors.load(source.authorId),
        },
        Query: {
            author: (source, args, context, info) => context.loaders.authors.load(args.id),
            allAuthors: (source, args, context, info) => context.loaders.authors.loadMany([], args.skip, args.limit),
            post: (source, args, context, info) => context.loaders.posts.load(args.id),
            allPosts: (source, args, context, info) => context.loaders.posts.loadMany([], args.skip, args.limit),
            doSomthing: (source, args, context, info) => Promise.reject(new Error('An error')),
            me: (source, args, context, info) => {
                if(!context.user) return;
                if((context.user || {}).id !== 'demo@domain.local') return;
                return resolvers.Me;
            },
        },
        Mutation: {
            upsertAuthor: (source, args, context, info) => context.loaders.authors.upsert(args.input),
            removeAuthor: (source, args, context, info) => context.loaders.authors.remove(args.input),
            upsertPost: (source, args, context, info) => context.loaders.posts.upsert(args.input),
            removePost: (source, args, context, info) => context.loaders.posts.remove(args.input),
        },
        User: {
            id: (source, args, context, info) => source.id,
        },
        Me: {
            user: (source, args, context, info) => context.user,
            author: (source, args, context, info) => resolvers.Query.author(source, args, context, info),
            allAuthors: (source, args, context, info) => resolvers.Query.allAuthors(source, args, context, info),
        },
        Subscription: {
            upsertedAuthor: (source, args, context, info) => context.loaders.load(source.id || args.id),
            removedAuthor: (source, args, context, info) => source.id || args.id,
            upsertedPost: (source, args, context, info) =>  context.loaders.load(source.id || args.id),
            removedPost: (source, args, context, info) => source.id || args.id,            
        }
    };
}
