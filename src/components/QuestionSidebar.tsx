import { useStore } from "@nanostores/react";
import { SidebarCloseIcon } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import {
    Sidebar,
    SidebarContent,
    SidebarContext,
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar-l";
import {
    autoSave,
    displayLibraries,
    displayMcDonalds,
    displayMontrealDistricts,
    isLoading,
    questions,
    save,
    triggerLocalRefresh,
} from "@/lib/context";

import { AddQuestionDialog } from "./AddQuestionDialog";
import {
  MatchingQuestionComponent,
  RadiusQuestionComponent,
  TentacleQuestionComponent,
  ThermometerQuestionComponent,
} from "./QuestionCards";

export const QuestionSidebar = () => {
    useStore(triggerLocalRefresh);
    const $questions = useStore(questions);
    const $autoSave = useStore(autoSave);
    const $isLoading = useStore(isLoading);
    const $displayMcDonalds = useStore(displayMcDonalds);
    const $displayLibraries = useStore(displayLibraries);
    const $displayMontrealDistricts = useStore(displayMontrealDistricts);

    return (
        <Sidebar>
            <div className="flex items-center justify-between">
                <h2 className="ml-4 mt-4 font-poppins text-2xl">Questions</h2>
                <SidebarCloseIcon
                    className="mr-2 visible md:hidden"
                    onClick={() => {
                        SidebarContext.get().setOpenMobile(false);
                    }}
                />
            </div>
            <div className="mx-4 mt-4 flex flex-col gap-3">
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="displayMontrealDistricts"
                        checked={$displayMontrealDistricts}
                        onCheckedChange={(checked) => displayMontrealDistricts.set(checked === true)}
                    />
                    <label
                        htmlFor="displayMontrealDistricts"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                        Show Montreal Districts
                    </label>
                </div>
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="displayMcDonalds"
                        checked={$displayMcDonalds}
                        onCheckedChange={(checked) => displayMcDonalds.set(checked === true)}
                    />
                    <label
                        htmlFor="displayMcDonalds"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                        Show McDonalds
                    </label>
                </div>
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="displayLibraries"
                        checked={$displayLibraries}
                        onCheckedChange={(checked) => displayLibraries.set(checked === true)}
                    />
                    <label
                        htmlFor="displayLibraries"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                        Show Libraries
                    </label>
                </div>
            </div>
            <SidebarContent>
                {$questions.map((question) => {
                    switch (question.id) {
                        case "radius":
                            return (
                                <RadiusQuestionComponent
                                    data={question.data}
                                    key={question.key}
                                    questionKey={question.key}
                                />
                            );
                        case "thermometer":
                            return (
                                <ThermometerQuestionComponent
                                    data={question.data}
                                    key={question.key}
                                    questionKey={question.key}
                                />
                            );
                        case "tentacles":
                            return (
                                <TentacleQuestionComponent
                                    data={question.data}
                                    key={question.key}
                                    questionKey={question.key}
                                />
                            );
        case "matching":
          return (
            <MatchingQuestionComponent
              data={question.data}
              key={question.key}
              questionKey={question.key}
            />
          );
        default:
                            return null;
                    }
                })}
            </SidebarContent>
            <SidebarGroup>
                <SidebarGroupContent>
                    <SidebarMenu data-tutorial-id="add-questions-buttons">
                        <SidebarMenuItem>
                            <AddQuestionDialog>
                                <SidebarMenuButton
                                    disabled={$isLoading}
                                    className="h-16 text-lg"
                                >
                                    Add Question
                                </SidebarMenuButton>
                            </AddQuestionDialog>
                        </SidebarMenuItem>
                        {!$autoSave && (
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    className="bg-blue-600 p-2 rounded-md font-semibold font-poppins transition-shadow duration-500"
                                    onClick={save}
                                    disabled={$isLoading}
                                >
                                    Save
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )}
                    </SidebarMenu>
                </SidebarGroupContent>
            </SidebarGroup>
        </Sidebar>
    );
};
