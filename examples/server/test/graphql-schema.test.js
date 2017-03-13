const assert = require('assert');
const pouchdb = require('../lib/pouchdb');
const loaders = require('../lib/loaders');
const schema = require('../lib/schema');   
const graphql = require('graphql');

describe('Database integration - GraphQL query and mutation schema', () => {
    describe('for author entity', () => {
        const authors = pouchdb('authors');
        const posts = pouchdb('posts');
        const database = pouchdb();

        before(() => {
            return Promise.all([
                authors.upsert({id: 'John Doe', name: 'John Doe', }),
                authors.upsert({id: 'Max May', name: 'Max May', }),
                posts.upsert({id: '1', title: 'Post Title 1', text: 'Post Text 1', authorId: 'John Doe' }),
                posts.upsert({id: '2', title: 'Post Title 2', text: 'Post Text 2', authorId: 'Max May' }),
                posts.upsert({id: '3', title: 'Post Title 3', text: 'Post Text 3', authorId: 'John Doe' }),
            ]);
        });

        after(() => {
            return Promise.all([
                authors.removeAll(),
                posts.removeAll(),
            ]);
        });     

        it('Query fetch_author with id: John Doe should return the author', () => {
            return graphql.graphql(schema, `query fetch_author($id: ID!) {
                author(id: $id) {
                    id
                    name
                    posts {
                        id
                        title
                        text
                    }      
                }
            }`, {root: {}}, {user: {id: 'demo@domain.local'}, loaders: loaders()}, { id: 'John Doe' })
            .then(actual => {                
                const expected =  { 
                    id: 'John Doe',
                    name: 'John Doe',
                    posts: [{
                        id: '1',
                        title: "Post Title 1",
                        text: "Post Text 1",
                    }, {
                        id: '3',
                        title: "Post Title 3",
                        text: "Post Text 3",
                    }]
                };
                assert.deepEqual(actual.data.author, expected);
            });        
        });

        it('Query fetch_all_authors should return the authors', () => {
            return graphql.graphql(schema, `query fetch_all_authors {
                allAuthors {
                    id
                    name
                    posts {
                        id
                        title
                        text
                    }      
                }
            }`, {root: {}}, {user: {id: 'demo@domain.local'}, loaders: loaders()}, { id: 1 })
            .then(actual => {
                const expected = [{
                    id: 'John Doe',
                    name: 'John Doe',
                    posts: [{
                        id: '1',
                        title: "Post Title 1",
                        text: "Post Text 1",
                    },{
                        id: '3',
                        title: "Post Title 3",
                        text: "Post Text 3",
                    }],
                }, {
                    id: 'Max May',
                    name: 'Max May',
                    posts:  [{
                        id: '2',
                        title: "Post Title 2",
                        text: "Post Text 2",
                    }],
                }];
                assert.deepEqual(actual.data.allAuthors,  expected);
            });        
        });

        it('Mutation insert_author should return created author', () => {
            return graphql.graphql(schema, `mutation insert_author($input: AuthorInput!) {
                upsertAuthor(input: $input) {
                    id
                    name
                }
            }`, {root: {}}, {user: {id: 'demo@domain.local'}, loaders: loaders()}, { input: {id: 'Insert User', name: 'Insert User'} })
            .then(actual => {
                assert.deepEqual(actual.data.upsertAuthor, {id: 'Insert User', name: 'Insert User'});
            });    
        });

        it('Mutation update_author should return changed author', () => {
            return graphql.graphql(schema, `query fetch_author($id: ID!) {
                author(id: $id) {
                    id
                    rev
                }
            }`, {root: {}}, {user: {id: 'demo@domain.local'}, loaders: loaders()}, { id: 'John Doe' })
            .then(actual => graphql.graphql(schema, `mutation update_author($input: AuthorInput!) {
                upsertAuthor(input: $input) {
                    id
                    name
                }
            }`, {root: {}}, {user: {id: 'demo@domain.local'}, loaders: loaders()}, { input: {id: actual.data.author.id, rev: actual.data.author.rev, name: 'Changed User', } }))
            .then(actual => {
                assert.deepEqual(actual.data.upsertAuthor, {id: 'John Doe', name: 'Changed User'});
            });   
        });

        it('Mutation remove_author should return remove author ID', () => {
            return graphql.graphql(schema, `query fetch_author($id: ID!) {
                author(id: $id) {
                    id
                    rev
                }
            }`, {root: {}}, {user: {id: 'demo@domain.local'}, loaders: loaders()}, { id: 'John Doe' })
            .then(actual => graphql.graphql(schema, `mutation remove_author($input: AuthorInput!) {
                removeAuthor(input: $input)
            }`, {root: {}}, {user: {id: 'demo@domain.local'}, loaders: loaders()}, { input: { id: actual.data.author.id, rev: actual.data.author.rev, } }))
            .then(actual => {
                assert.equal(actual.data.removeAuthor, 'John Doe');
            });    
        });       
    });

    describe('for post entity', () => {
        const authors = pouchdb('authors');
        const posts = pouchdb('posts');
        const database = pouchdb();

        before(() => {
            return Promise.all([
                authors.upsert({id: 'John Doe', name: 'John Doe', }),
                authors.upsert({id: 'Max May', name: 'Max May', }),
                posts.upsert({id: '1', title: 'Post Title 1', text: 'Post Text 1', authorId: 'John Doe' }),
                posts.upsert({id: '2', title: 'Post Title 2', text: 'Post Text 2', authorId: 'Max May' }),
                posts.upsert({id: '3', title: 'Post Title 3', text: 'Post Text 3', authorId: 'John Doe' }),
            ]);
        });

        after(() => {
            return Promise.all([
                authors.removeAll(),
                posts.removeAll(),
            ]);
        });        

        it('Query fetch_post with id: 1 should return the author', () => {
            return graphql.graphql(schema, `query fetch_post($id: ID!) {
                post(id: $id) {
                    id
                    title
                    text
                    author {
                        name
                    }      
                }
            }`, {root: {}}, {user: {id: 'demo@domain.local'}, loaders: loaders()}, { id: 1 })
            .then(actual => {
                const expected = {
                    id: 1,
                    title: 'Post Title 1',
                    text: 'Post Text 1',
                    author: {
                        name: 'John Doe'
                    }
                };
                assert.deepEqual(actual.data.post,  expected);
            });        
        });

        it('Query fetch_all_posts should return the authors', () => {
            return graphql.graphql(schema, `query fetch_all_posts {
                allPosts {
                    id
                    title
                    text
                    author {
                        name
                    }      
                }
            }`, {root: {}}, {user: {id: 'demo@domain.local'}, loaders: loaders()}, { id: 1 })
            .then(actual => {
                const expected = [{
                    id: 1,
                    title: 'Post Title 1',
                    text: 'Post Text 1',
                    author: {
                        name: 'John Doe'
                    }
                }, {
                    id: 2,
                    title: 'Post Title 2',
                    text: 'Post Text 2',
                    author: {
                        name: 'Max May'
                    }
                }, {
                    id: 3,
                    title: 'Post Title 3',
                    text: 'Post Text 3',
                    author: {
                        name: 'John Doe'
                    }
                }];
                assert.deepEqual(actual.data.allPosts, expected);
            });        
        });

        it('Mutation insert_post should return created post', () => {
            return graphql.graphql(schema, `mutation insert_post($input: PostInput!) {
                upsertPost(input: $input) {
                    id
                    title
                    text                
                    author {
                        name
                    }
                }
            }`, {root: {}}, {user: {id: 'demo@domain.local'}, loaders: loaders()}, { input: { id: 4, title: 'Insert Post Title', text: 'Insert Post Text', authorId: 'John Doe'} })
            .then(actual => {
                const expected =  {
                    id: 4,
                    title: 'Insert Post Title',
                    text: 'Insert Post Text',
                    author: {
                        name: 'John Doe',
                    }
                };
                assert.deepEqual(actual.data.upsertPost, expected);
            });    
        });

        it('Mutation update_post should return changed author', () => {
            return graphql.graphql(schema, `query fetch_post($id: ID!) {
                post(id: $id) {
                    id
                    rev
                }
            }`, {root: {}}, {user: {id: 'demo@domain.local'}, loaders: loaders()}, { id: 4 })            
            .then(actual => graphql.graphql(schema, `mutation update_post($input: PostInput!) {
                upsertPost(input: $input) {
                    id
                    title
                    text
                    author {
                        name
                    }
                }
            }`, {root: {}}, {user: {id: 'demo@domain.local'}, loaders: loaders()}, { input: {id: actual.data.post.id, rev: actual.data.post.rev, title: 'Changed Post Title', text: 'Changed Post Text', authorId: 'Max May'} }))
            .then(actual => {
                const expected =  {
                    id: 4,
                    title: 'Changed Post Title',
                    text: 'Changed Post Text',
                    author: {
                        name: 'Max May',
                    }
                };                        
                assert.deepEqual(actual.data.upsertPost, expected);
            });    
        });

        it('Mutation remove_post should return changed author', () => {
             return graphql.graphql(schema, `query fetch_post($id: ID!) {
                post(id: $id) {
                    id
                    rev
                }
            }`, {root: {}}, {user: {id: 'demo@domain.local'}, loaders: loaders()}, { id: 4 }) 
            .then(actual => graphql.graphql(schema, `mutation remove_post($input: PostInput!) {
                removePost(input: $input) 
            }`, {root: {}}, {user: {id: 'demo@domain.local'}, loaders: loaders()}, { input: {id: actual.data.post.id, rev: actual.data.post.rev, } }))
            .then(actual => {
                assert.deepEqual(actual.data.removePost, 4);
            });    
        });       
    });
});

describe('Auth GraphQL API and DB integration', () => {
    const authors = pouchdb('authors');
    const posts = pouchdb('posts');
    const database = pouchdb();

    before(() => {
        return Promise.all([
            authors.upsert({id: 'John Doe', name: 'John Doe', }),
            authors.upsert({id: 'Max May', name: 'Max May', }),
            posts.upsert({id: '1', title: 'Post Title 1', text: 'Post Text 1', authorId: 'John Doe' }),
            posts.upsert({id: '2', title: 'Post Title 2', text: 'Post Text 2', authorId: 'Max May' }),
            posts.upsert({id: '3', title: 'Post Title 3', text: 'Post Text 3', authorId: 'John Doe' }),
        ]);
    });

    after(() => {
        return Promise.all([
            authors.removeAll(),
            posts.removeAll(),
        ]);
    });

    describe('for user demo@domain.local author entity', () => {
        it('Query fetch_author with id: 1 should return the author', () => {
            return graphql.graphql(schema, `query fetch_author($id: ID) {
                me {
                    user {
                        id
                    }
                    author(id: $id) {
                        id
                        name
                        posts {
                            id
                            title
                            text
                        }      
                    }
                }
            }`, {root: {}}, {user: {id: 'demo@domain.local'}, loaders: loaders()}, { id: 'John Doe' })
            .then(actual => {
                const expected = {                
                    user: {
                        id: 'demo@domain.local',
                    },
                    author: { 
                        id: 'John Doe',
                        name: 'John Doe',
                        posts: [{
                            id: 1,
                            title: "Post Title 1",
                            text: "Post Text 1",
                        }, {
                            id: 3,
                            title: "Post Title 3",
                            text: "Post Text 3",
                        }]
                    }
                };
                assert.deepEqual(actual.data.me, expected);
            });        
        });

        it('Query fetch_all_authors should return the authors', () => {
            return graphql.graphql(schema, `query fetch_all_authors {
                me {
                    user {
                        id
                    }
                    allAuthors {
                        id
                        name
                        posts {
                            id
                            title
                            text
                        }      
                    }
                }
            }`, {root: {}}, {user: {id: 'demo@domain.local'}, loaders: loaders()}, { id: 1 })
            .then(actual => {
                const expected = {
                    user: {
                        id: 'demo@domain.local',
                    },
                    allAuthors: [{
                        id: 'John Doe',
                        name: 'John Doe',
                        posts: [{
                            id: 1,
                            title: "Post Title 1",
                            text: "Post Text 1",
                        },{
                            id: 3,
                            title: "Post Title 3",
                            text: "Post Text 3",
                        }],
                    }, {
                        id: 'Max May',
                        name: 'Max May',
                        posts:  [{
                            id: 2,
                            title: "Post Title 2",
                            text: "Post Text 2",
                        }],
                    }]
                };
                assert.deepEqual(actual.data.me,  expected);
            });        
        });      
    });
});