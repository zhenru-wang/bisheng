import AssistantSetting from "@/components/Pro/security/AssistantSetting";
import { TitleIconBg } from "@/components/bs-comp/cardComponent";
import KnowledgeSelect from "@/components/bs-comp/selectComponent/knowledge";
import SkillSheet from "@/components/bs-comp/sheets/SkillSheet";
import ToolsSheet from "@/components/bs-comp/sheets/ToolsSheet";
import { ToolIcon } from "@/components/bs-icons/tool";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/bs-ui/accordion";
import { Button } from "@/components/bs-ui/button";
import { InputList, Textarea } from "@/components/bs-ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/bs-ui/tooltip";
import { useAssistantStore } from "@/store/assistantStore";
import {
  MinusCircledIcon,
  PlusCircledIcon,
  PlusIcon,
  QuestionMarkCircledIcon,
  ReloadIcon,
} from "@radix-ui/react-icons";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import ModelSelect from "./ModelSelect";
import Temperature from "./Temperature";
import { locationContext } from "@/contexts/locationContext";
import { useContext } from "react";

export default function Setting() {
  const { t } = useTranslation();

  const { appConfig } = useContext(locationContext)
  let { assistantState, dispatchAssistant } = useAssistantStore();

  return (
    <div
      id="skill-scroll"
      className="h-full w-[50%] overflow-y-auto scrollbar-hide"
    >
      <h1 className="border bg-gray-50 indent-4 text-sm leading-8 text-muted-foreground">
        {t("build.basicConfiguration")}
      </h1>
      <Accordion type="multiple" className="w-full">
        {/* 基础配置 */}
        <AccordionItem value="item-1">
          <AccordionTrigger>
            <span>{t("build.modelConfiguration")}</span>
          </AccordionTrigger>
          <AccordionContent className="py-2">
            <div className="mb-4 px-6">
              <label htmlFor="model" className="bisheng-label">
                {t("build.model")}
              </label>
              <ModelSelect
                value={assistantState.model_name}
                onChange={(val) =>
                  dispatchAssistant("setting", { model_name: val })
                }
              />
            </div>
            <div className="mb-4 px-6">
              <label htmlFor="slider" className="bisheng-label">
                {t("build.temperature")}
              </label>
              <Temperature
                value={assistantState.temperature}
                onChange={(val) =>
                  dispatchAssistant("setting", { temperature: val })
                }
              ></Temperature>
            </div>
          </AccordionContent>
        </AccordionItem>
        {/* 开场引导 */}
        <AccordionItem value="item-2">
          <AccordionTrigger>
            <span>{t("build.openingIntroduction")}</span>
          </AccordionTrigger>
          <AccordionContent className="py-2">
            <div className="mb-4 px-6">
              <label htmlFor="open" className="bisheng-label">
                {t("build.openingStatement")}
              </label>
              <Textarea
                name="open"
                className="mt-2 min-h-[34px]"
                style={{ height: 56 }}
                placeholder={t("build.assistantMessageFormat")}
                value={assistantState.guide_word}
                onChange={(e) =>
                  dispatchAssistant("setting", { guide_word: e.target.value })
                }
              ></Textarea>
              {assistantState.guide_word.length > 1000 && (
                <p className="bisheng-tip mt-1">
                  {t("build.maximumPromptLength")}
                </p>
              )}
            </div>
            <div className="mb-4 px-6">
              <label htmlFor="open" className="bisheng-label flex gap-1">
                {t("build.guidingQuestions")}
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <QuestionMarkCircledIcon />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t("build.recommendQuestionsForUsers")}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </label>
              <InputList
                rules={[{ maxLength: 50, message: t("build.maxCharacters50") }]}
                value={assistantState.guide_question}
                onChange={(list) => {
                  dispatchAssistant("setting", { guide_question: list });
                }}
                placeholder={t("build.enterGuidingQuestions")}
              ></InputList>
            </div>
          </AccordionContent>
        </AccordionItem>
        {/* 内容安全审查 */}
        {appConfig.isPro && <AssistantSetting id={assistantState.id} type={3} />}
      </Accordion>
      <h1 className="border-b bg-gray-50 indent-4 text-sm leading-8 text-muted-foreground">
        {t("build.knowledge")}
      </h1>
      <Accordion type="multiple" className="w-full">
        {/* 知识库 */}
        <AccordionItem value="item-1">
          <AccordionTrigger>
            <div className="flex flex-1 items-center justify-between">
              <span>{t("build.knowledgeBase")}</span>
              {/* <Popover>
              <PopoverTrigger asChild className="group">
                  <Button variant="link" size="sm"><TriangleRightIcon className="group-data-[state=open]:rotate-90" /> {t('build.autoCall')}</Button>
              </PopoverTrigger>
              <PopoverContent className="w-[560px]">
                  <div className="flex justify-between">
                      <label htmlFor="model" className="bisheng-label">{t('build.callingMethod')}</label>
                      <div>
                          <RadioCard checked={false} title={t('build.autoCall')} description={t('build.autoCallDescription')} calssName="mb-4"></RadioCard>
                          <RadioCard checked title={t('build.onDemandCall')} description={t('build.onDemandCallDescription')} calssName="mt-4"></RadioCard>
                      </div>
                  </div>
              </PopoverContent>
          </Popover> */}
            </div>
          </AccordionTrigger>
          <AccordionContent className="py-2">
            <div className="mb-4 px-6">
              <div className="flex gap-4">
                <KnowledgeSelect
                  multiple
                  value={assistantState.knowledge_list.map(el => ({ label: el.name, value: el.id }))}
                  onChange={(vals) =>
                    dispatchAssistant("setting", { knowledge_list: vals.map(el => ({ name: el.label, id: el.value })) })
                  }
                >
                  {(reload) => (
                    <div className="flex justify-between">
                      <Link to={"/filelib"} target="_blank">
                        <Button variant="link">
                          <PlusCircledIcon className="mr-1" />{" "}
                          {t("build.createNewKnowledge")}
                        </Button>
                      </Link>
                      <Button variant="link" onClick={() => reload(1, '')}>
                        <ReloadIcon className="mr-1" /> {t("build.refresh")}
                      </Button>
                    </div>
                  )}
                </KnowledgeSelect>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <h1 className="border-b bg-gray-50 indent-4 text-sm leading-8 text-muted-foreground">
        {t("build.abilities")}
      </h1>
      <Accordion
        type="multiple"
        className="w-full"
        onValueChange={(e) =>
          e.includes("skill") &&
          document.getElementById("skill-scroll").scrollTo({ top: 9999 })
        }
      >
        {/* 工具 */}
        <AccordionItem value="item-1">
          <AccordionTrigger>
            <div className="flex flex-1 items-center justify-between">
              <span>{t("build.tools")}</span>
              <ToolsSheet
                select={assistantState.tool_list}
                onSelect={(tool) =>
                  dispatchAssistant("setting", {
                    tool_list: [...assistantState.tool_list, tool],
                  })
                }
              >
                <PlusIcon
                  className="mr-2 text-primary hover:text-primary/80"
                  onClick={(e) => e.stopPropagation()}
                ></PlusIcon>
              </ToolsSheet>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="px-4">
              {assistantState.tool_list.map((tool) => (
                <div
                  key={tool.id}
                  className="group mt-2 flex cursor-pointer items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <TitleIconBg id={tool.id} className="h-7 w-7">
                      <ToolIcon />
                    </TitleIconBg>
                    <p className="text-sm">{tool.name}</p>
                  </div>
                  <MinusCircledIcon
                    className="hidden text-primary group-hover:block"
                    onClick={() =>
                      dispatchAssistant("setting", {
                        tool_list: assistantState.tool_list.filter(
                          (t) => t.id !== tool.id
                        ),
                      })
                    }
                  />
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
        {/* 技能 */}
        <AccordionItem value="skill">
          <AccordionTrigger>
            <div className="flex flex-1 items-center justify-between">
              <span className="flex items-center gap-1">
                <span>{t("build.skill")}</span>
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <QuestionMarkCircledIcon />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t("build.skillDescription")}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </span>
              <SkillSheet
                select={assistantState.flow_list}
                onSelect={(flow) =>
                  dispatchAssistant("setting", {
                    flow_list: [...assistantState.flow_list, flow],
                  })
                }
              >
                <PlusIcon
                  className="mr-2 text-primary hover:text-primary/80"
                  onClick={(e) => e.stopPropagation()}
                ></PlusIcon>
              </SkillSheet>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="px-4">
              {assistantState.flow_list.map((flow) => (
                <div
                  key={flow.id}
                  className="group mt-2 flex cursor-pointer items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <TitleIconBg id={flow.id} className="h-7 w-7"></TitleIconBg>
                    <p className="text-sm">{flow.name}</p>
                  </div>
                  <MinusCircledIcon
                    className="hidden text-primary group-hover:block"
                    onClick={() =>
                      dispatchAssistant("setting", {
                        flow_list: assistantState.flow_list.filter(
                          (t) => t.id !== flow.id
                        ),
                      })
                    }
                  />
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
