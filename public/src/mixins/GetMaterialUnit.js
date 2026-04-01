import {
    API,
    graphqlOperation
} from "aws-amplify";
import {
    create_list_edit_delete_units
} from "@/graphql/mutations.js";

export const get_material_unit = {
    data: () => ({
        unitmaterials: [],

    }),
    methods: {
        async get_material_unit() {
            var data = this.$store.getters.GetUserObj;
            try {
                let result = await API.graphql(
                    graphqlOperation(create_list_edit_delete_units, {
                        input: {
                            action_type: "LIST",
                            organization_id: data.organization.organization_id,
                        },
                    })
                );
                this.unitmaterials = [];
                var response = JSON.parse(result.data.create_list_edit_delete_units);
                if (response.Status == "SUCCESS") {
                    this.unitmaterials = response.data;
                }
            } catch (error) {
                //  console.log(error)
            }
        },
    }
}