const {
  GraphQLBoolean,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString
} = require('graphql');

const { addSong, removeSong } = require('./playlist');

// Queries
const queryType = new GraphQLObjectType({
  name: 'Query',
  fields: {
    getQueue: {
      type: GraphQLString,
      resolve: () => {
        addSong('https://youtu.be/dQw4w9WgXcQ');
      }
    }
  //   whoIsGoingOut: {
  //     type: new GraphQLList(GraphQLString),
  //     resolve: ({ session }) => {
  //       if (!session.isLoggedIn) return null;

  //       return global.goingOutUsernames;
  //     }
  //   }
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
