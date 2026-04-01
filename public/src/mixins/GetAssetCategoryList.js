import {
    API,
    graphqlOperation
} from "aws-amplify";
import {
    asset_categories
} from "@/graphql/mutations.js";

export const get_asset_categories = {
    data: () => ({
        assetCategories: [],
       
    }),
    methods: {
        async get_asset_categories() {
            var data = this.$store.getters.GetUserObj;
            try {
                let result = await API.graphql(
                  graphqlOperation(asset_categories, {
                    input: {
                        user_email_id: data.user.user_email_id,
                        action_type: "LIST_CATEGORY",
                      },
                  })
                );
                this.assetCategories =[];
                var response = JSON.parse(result.data.asset_categories);
                if (response.Status == "SUCCESS") {
                var categoriesRecords = response.data;
                
                categoriesRecords.forEach((element) => {
                    this.assetCategories.push({
                      text: element.category_name,
                      value: element.category_id,
                    });
                  });
                }
              } catch (error) {
                //  console.log(error)
              }
        },
    }
}