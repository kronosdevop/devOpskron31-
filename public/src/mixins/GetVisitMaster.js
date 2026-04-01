import { API, graphqlOperation } from "aws-amplify";
import { get_visit_workflows } from "@/graphql/queries.js";

export const get_visittype_master = {
  data: () => ({
    Mastervisit: [],
  }),
  methods: {
    async get_visittype_master() {
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(get_visit_workflows, {
            input: {
              organization_id: data.organization.organization_id,
            },
          })
        );
        this.Mastervisit = [];

        var response = JSON.parse(result.data.get_visit_workflows);
        if (response.Status == "SUCCESS") {
          this.Mastervisit = response.data;
        }
      } catch (error) {}
    },
  },
};
