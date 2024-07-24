import React, { useState } from "react";
import { Handle, NodeToolbar, Position, useReactFlow } from "reactflow";
import { Code, Trash2, Pencil, X } from "lucide-react";
import CustomButton from "../buttons/CustomButton";
import { ApplePodcastsLogo, FilePy } from "@phosphor-icons/react";
import EditWorkflowButton from "../buttons/EditWorkflowButton";
import CustomButtonBig from "../buttons/CustomButtonBig";
import { getSession } from "../../services/sessionService";
import { updateUser } from "../../api/user";
import toast from "react-hot-toast";
export default function CodeNode({ id, data }) {
  const reactFlowInstance = useReactFlow();
  const deleteNode = () => {
    reactFlowInstance.setNodes((nds) => nds.filter((node) => node.id !== id));
  };
  const [isCreateHubModalOpen, setIsCreateHubModalOpen] = useState(false);

  const toggleCreateHubModal = () => {
    setIsCreateHubModalOpen((prevState) => !prevState);
  };

  return (
    <>
      <NodeToolbar
        isVisible={data.forceToolbarVisible || undefined}
        position={data.toolbarPosition}
        className="flex gap-1"
      >
        <button>
          <div className="" onClick={toggleCreateHubModal}>
            {" "}
            <CustomButton
              text={"Edit"}
              color={"#355cc9"}
              Icon={Pencil}
            ></CustomButton>
          </div>
        </button>
        <button className="flex gap-1" onClick={deleteNode}>
          <CustomButton
            text={"Delete"}
            color={"#b91c1c"}
            Icon={Trash2}
          ></CustomButton>
        </button>
      </NodeToolbar>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
      <div className="w-20 h-20 bg-componentBg border-2 border-componentBorder rounded-sm  ">
        <div className="flex justify-center items-center h-full">
          <p className="text-sm">
            <Code size={35} color="orange"></Code>
          </p>
        </div>
        <div className="relative -top-[27px] right-[2px] text-right ">
          <FilePy size={16} weight="fill" />
        </div>
        <div className="relative -top-5">
          <p className="text-white text-[12px] text-center font-medium ">
            {data?.label}
          </p>
        </div>
      </div>
    </>
  );
}
