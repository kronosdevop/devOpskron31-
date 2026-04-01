import {
    API,
    graphqlOperation
} from "aws-amplify";
import {
    asset_sub_category
} from "@/graphql/mutations.js";

export const get_asset_sub_categories = {
    data: () => ({
        assetSubCategories: [],
       
    }),
    methods: {
        async get_asset_sub_categories() {
            var data = this.$store.getters.GetUserObj;
            try {
                let result = await API.graphql(
                  graphqlOperation(asset_sub_category, {
                    input: {
                        user_email_id: data.user.user_email_id,
                        action_type: "LIST_SUBCATEGORY",
                      },
                  })
                );
                this.assetSubCategories =[];
                var response = JSON.parse(result.data.asset_sub_category);
                if (response.Status == "SUCCESS") {
                this.assetSubCategories = response.data;
                }
              } catch (error) {
                //  console.log(error)
              }
        },
    }
}