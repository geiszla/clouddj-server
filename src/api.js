const {
  GraphQLBoolean,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString
} = require('graphql');

const { addSong, removeSong } = require('./playlist');

const playlistSongType = new GraphQLObjectType({
  name: 'PlaylistSong',
  fields: {}
});

// Queries
const queryType = new GraphQLObjectType({
  name: 'Query',
  fields: {
    getQueue: {
      type: new GraphQLList(playlistSongType),
      resolve: () => addSong('https://youtu.be/dQw4w9WgXcQ')
    }
  }
});

// Mutations
const mutationType = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    addLink: {
      type: new GraphQLNonNull(GraphQLBoolean),
      args: {
        link: { type: new GraphQLNonNull(GraphQLString) }
      },
      resolve: async (_, { link }) => addSong(link)
    },
    removeSong: {
      type: new GraphQLNonNull(GraphQLBoolean),
      args: {
        playlistSongId: { type: new GraphQLNonNull(GraphQLString) }
      },
      resolve: async (_, { playlistSongId }) => removeSong(playlistSongId)
    }
  }
});

exports = new GraphQLSchema({ query: queryType, mutation: mutationType });
