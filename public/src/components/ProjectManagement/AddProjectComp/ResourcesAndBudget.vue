<template>
    <div>
        <v-card>
            <v-card-actions class="justify-end mt-2">
                <v-btn
                    depressed
                    @click="back_action()"
                    dark
                    class="cardCss text-capitalize button-corner ml-2"
                >
                    Back
                </v-btn>
                <v-btn
                    depressed
                    @click="validate_budget()"
                    dark
                    class="cardCss text-capitalize button-corner ml-2"
                >
                    Next
                </v-btn>
            </v-card-actions>
            <v-card-text>
                <v-form ref="form3">
                    <v-row no-gutters class="">
                        <v-col cols="6">
                            <v-textarea
                                density="compact"
                                auto-grow
                                variant="outlined"
                                class=""
                                rows="0"
                                label="Estimated Budget (Actual Value)"
                                v-model="estimatedBudgetActualValue"
                            ></v-textarea>
                        </v-col>
                        <v-col cols="6" class="ml-2">
                            <v-textarea
                                density="compact"
                                auto-grow
                                variant="outlined"
                                class=""
                                rows="0"
                                label="Estimated Budget (Man-Month)"
                                v-model="estimatedBudgetManMonths"
                            ></v-textarea>
                        </v-col>
                        <v-col cols="6">
                            <v-textarea
                                density="compact"
                                variant="outlined"
                                label="Resources Required(Assets,Tools) for Actual Value"
                                v-model="resourcesRequiredActualValue"
                                auto-grow
                                rows="0"
                            />
                        </v-col>
                        <v-col cols="6" class="ml-2">
                            <v-textarea
                                density="compact"
                                variant="outlined"
                                label="Resources Required(Assets,Tools) for Man-Month"
                                v-model="resourcesRequiredManMonths"
                                auto-grow
                                rows="0"
                            />
                        </v-col>
                    </v-row>
                </v-form>
            </v-card-text>
        </v-card>
    </div>
</template>

<script>
export default {
    data() {
        return {
            estimatedBudgetActualValue: "",
            estimatedBudgetManMonths: "",
            resourcesRequiredActualValue: "",
            resourcesRequiredManMonths: "",
            // Keep these for backward compatibility with existing structure
            estimatedBudget: "MAN_MONTHS",
            estimatedData: "",
            resourcesRequired: "",
        }
    },
    methods: {
      async  validate_budget() {
        const {valid} = await this.$refs.form3.validate();
            if (valid) {
                // Determine which budget type to use (prioritize Man-Month if filled, else Actual Value)
                if (this.estimatedBudgetManMonths) {
                    this.estimatedBudget = "MAN_MONTHS";
                    this.estimatedData = this.estimatedBudgetManMonths;
                    this.resourcesRequired = this.resourcesRequiredManMonths;
                } else if (this.estimatedBudgetActualValue) {
                    this.estimatedBudget = "ACTUAL_VALUE";
                    this.estimatedData = this.estimatedBudgetActualValue;
                    this.resourcesRequired = this.resourcesRequiredActualValue;
                } else {
                    // Default to MAN_MONTHS if neither is filled
                    this.estimatedBudget = "MAN_MONTHS";
                    this.estimatedData = "";
                    this.resourcesRequired = "";
                }
                
                this.$emit("submitBudget", {
                    // Keep existing keys for backward compatibility
                    estimatedBudget: this.estimatedBudget,
                    estimatedData: this.estimatedData,
                    resourcesRequired: this.resourcesRequired,
                    // Add new keys for all four fields
                    estimatedBudgetActualValue: this.estimatedBudgetActualValue,
                    estimatedBudgetManMonths: this.estimatedBudgetManMonths,
                    resourcesRequiredActualValue: this.resourcesRequiredActualValue,
                    resourcesRequiredManMonths: this.resourcesRequiredManMonths,
                });
            } else {
                this.$emit("validationError", "Please fill all required fields before proceeding.");
            }
        },
        back_action() {
            this.$emit("goBack");
        }
    },
};
</script>


<style>

</style>