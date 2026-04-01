import { list_games } from "@/graphql/queries";
import { API, graphqlOperation } from "aws-amplify";

export const ListScheduledGames = {
  data: () => ({
    loading: false,
    ListScheduledGames: [],
  }),

  methods: {
    async ListScheduledGamesMethod() {
      this.loading = true;
      try {
        const result = await API.graphql(
          graphqlOperation(list_games, {
            input: {},
          }),
        );
        let resultObj = JSON.parse(result.data.list_games);
        if (resultObj.Status === "SUCCESS") {
          this.ListScheduledGames = resultObj.data;
        }
        this.loading = false;
      } catch (error) {
        this.ListScheduledGames = [];
      } finally {
        this.loading = false;
      }
    },
  },
};
