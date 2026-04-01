import { list_all_projects } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";

export const get_all_projects = {
    data() {
        return {
            masterProjects: [],
            projectsLoading: false,
        };
    },
    methods: {
        async get_all_projects() {
            try {
                this.projectsLoading = true;
                const orgDetails = this.$store.getters.GetOrgDetails;

                if (!orgDetails || !orgDetails.organization || !orgDetails.organization.organization_id) {
                    console.warn("Organization details not available for fetching projects");
                    return;
                }

                const response = await API.graphql(
                    graphqlOperation(list_all_projects, {
                        organization_id: orgDetails.organization.organization_id,
                    })
                );

                let result = JSON.parse(response.data.list_all_projects);
                // console.log("result", result);
                if (result && result.items) {
                    this.masterProjects = result.items;
                }
                else {
                    this.masterProjects = [];
                }

            } catch (error) {
                this.masterProjects = [];
                console.error("Error fetching projects:", error);
            } finally {
                this.projectsLoading = false;
            }
        },
    },
};
