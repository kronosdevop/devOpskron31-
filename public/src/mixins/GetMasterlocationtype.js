
import {
    API,
    graphqlOperation
} from "aws-amplify";
import {
    create_list_edit_location_type
} from "@/graphql/mutations.js";

export const get_master_loactiontype = {
    data: () => ({
        masterlocationtype: [],

    }),
    methods: {
        async get_master_loactiontype() {
            var data = this.$store.getters.GetUserObj;
            try {
                let result = await API.graphql(
                    graphqlOperation(create_list_edit_location_type, {
                        input: {
                            action_type: "LIST",
                            organization_id: data.organization.organization_id,
                        },
                    })
                );
                this.masterlocationtype = [];
                var response = JSON.parse(result.data.create_list_edit_location_type);
                if (response.Status == "SUCCESS") {
                    this.masterlocationtype = response.data;
                }
            } catch (error) {
                //  console.log(error)
            }
        },
    }
}