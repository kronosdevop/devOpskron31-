import {
    API,
    graphqlOperation
} from "aws-amplify";
import {
    create_list_edit_delete_project_site
} from "@/graphql/mutations.js";

export const get_project_site = {
    data: () => ({
        siteProject: [],

    }),
    methods: {
        async get_project_site() {
            var data = this.$store.getters.GetUserObj;
            try {
                let result = await API.graphql(
                    graphqlOperation(create_list_edit_delete_project_site, {
                        input: {
                            action_type: "LIST_PROJECT_SITE",
                            organization_id: data.organization.organization_id,
                        },
                    })
                );
                this.siteProject = [];
                var response = JSON.parse(result.data.create_list_edit_delete_project_site);
                if (response.Status == "SUCCESS") {
                    this.siteProject = response.data;
                }
            } catch (error) {
                //  console.log(error)
            }
        },
    }
}