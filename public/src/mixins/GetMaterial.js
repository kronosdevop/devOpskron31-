import {
    API,
    graphqlOperation
} from "aws-amplify";
import {
    create_list_edit_delete_material
} from "@/graphql/mutations.js";

export const get_material_list = {
    data: () => ({
        materialList: [],

    }),
    methods: {
        async get_material_list() {
            var data = this.$store.getters.GetUserObj;
            try {
                let result = await API.graphql(
                    graphqlOperation(create_list_edit_delete_material, {
                        input: {
                            action_type: "LIST_MATERIAL",
                            organization_id: data.organization.organization_id,
                        },
                    })
                );
                this.materialList = [];
                var response = JSON.parse(result.data.create_list_edit_delete_material);
                if (response.Status == "SUCCESS") {
                    this.materialList = response.data;
                }
            } catch (error) {
                //  console.log(error)
            }
        },
    }
}