import {
    API,
    graphqlOperation
} from "aws-amplify";
import {
    list_all_org_projects
} from "@/graphql/queries.js";

export const get_Org_project_list = {
    data: () => ({
        OrgProjectList: [],

    }),
    methods: {
        async get_Org_project_list() {
            try {
                                const orgDetails = this.$store.getters.GetOrgDetails;

                let result = await API.graphql(
                    graphqlOperation(list_all_org_projects, {
                        input: {
                            organization_id: orgDetails.organization.organization_id,
                        },
                    })
                );
                this.ProjectList = [];
                var response = JSON.parse(result.data.list_all_org_projects);
                if (response.Status == "SUCCESS") {
                    this.OrgProjectList = response.projects;
                    // console.log("project", this.ProjectList)
                }
            } catch (error) {
                //  console.log(error)
            }
        },
    }
}