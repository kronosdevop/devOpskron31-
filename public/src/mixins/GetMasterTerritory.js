import {
    API,
    graphqlOperation
} from "aws-amplify";
import {
    create_list_edit_territories
} from "@/graphql/mutations.js";

export const get_master_terittory = {
    data: () => ({
        orgTerittory: [],

    }),
    methods: {
        async get_master_terittory() {
            var data = this.$store.getters.GetUserObj;
            try {
                let result = await API.graphql(
                    graphqlOperation(create_list_edit_territories, {
                        input: {
                            action_type: "LIST",
                            organization_id: data.organization.organization_id,
                        },
                    })
                );
                this.orgTerittory = [];
                var response = JSON.parse(result.data.create_list_edit_territories);
                if (response.Status == "SUCCESS") {
                    this.orgTerittory = response.data;
                }
            } catch (error) {
                //  console.log(error)
            }
        },
    }
}