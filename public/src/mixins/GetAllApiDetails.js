import { get_details_for_api_display } from "@/graphql/queries";
import { API, graphqlOperation } from "aws-amplify";

export const GetAllApiDetails = {
  data: () => ({
    loading: false,
    ListAllApiDetails: [],
  }),
  methods: {
    async GetAllApiDetailsMethod() {
      this.loading = true;
      try {
        const result = await API.graphql(
          graphqlOperation(get_details_for_api_display, {
            input: {},
          })
        );
        let resultObj = JSON.parse(result.data.get_details_for_api_display);
        if (resultObj.Status === "SUCCESS") {
          this.ListAllApiDetails = resultObj.data.categories;
          this.ApiInvokeUrl = resultObj.data.api_details.invoke_url;
        }
        this.loading = false;
      } catch (error) {
        this.loading = false;
        this.ListAllApiDetails = [];
      }
    },
  },
};
