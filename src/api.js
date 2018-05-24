const {
  GraphQLBoolean,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString
} = require('graphql');

const { addSong, addFromHistory, removeSong } = require('./queue');

const queueSongType = new GraphQLObjectType({
  name: 'queueSong',
  fields: {}
});

// Queries
const queryType = new GraphQLObjectType({
  name: 'Query',
  fields: {
    getQueue: {
      type: new GraphQLList(queueSongType),
      resolve: () => addSong('https://youtu.be/dQw4w9WgXcQ')
    }
  }
});

// Mutations
const mutationType = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    addSong: {
      type: new GraphQLNonNull(GraphQLBoolean),
      args: {
        link: { type: new GraphQLNonNull(GraphQLString) }
      },
      resolve: async (_, { link }) => addSong(link)
    },
    addFromHistory: {
      type: new GraphQLNonNull(GraphQLBoolean),
      args: {
        queueSongId: { type: new GraphQLNonNull(GraphQLString) }
      },
      resolve: async (_, { link }) => addFromHistory(link)
    },
    removeSong: {
      type: new GraphQLNonNull(GraphQLBoolean),
      args: {
        queueSongId: { type: new GraphQLNonNull(GraphQLString) }
      },
      resolve: async (_, { queueSongId }) => removeSong(queueSongId)
    }
  }
});

exports = new GraphQLSchema({ query: queryType, mutation: mutationType });
