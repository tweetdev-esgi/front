import React, { useRef, useState } from "react";
import { Handle, NodeToolbar, Position, useReactFlow } from "reactflow";
import { Play, Trash2, Upload, FileCheck2 } from "lucide-react";
import CustomButton from "../buttons/CustomButton";
import { FilePy } from "@phosphor-icons/react";
import toast from "react-hot-toast";

const RunNode = ({ id, data }) => {
  const reactFlowInstance = useReactFlow();
  const nodeRef = useRef(null);

  const deleteNode = () => {
    reactFlowInstance.setNodes((nds) => nds.filter((node) => node.id !== id));
  };
  const [file, setFile] = useState<any>(null);
  const fileInputRef = useRef(null);

  const handleFileInputChange = (e) => {
    const files = Array.from(e.target.files);
    setFile(files);
    console.log(files);
    if (files.length != 0) {
      toast.success(`Uploaded file ${files[0].name}`);
    }
  };

  const openFilePicker = () => {
    fileInputRef.current.click();
  };

  return (
    <>
      <NodeToolbar
        isVisible={data.forceToolbarVisible || undefined}
        position={data.toolbarPosition}
      >
        <div className="flex gap-2">
          <button className="" onClick={openFilePicker}>
            <CustomButton
              text={"Upload"}
              color={"#7a4eea"}
              Icon={Upload}
            ></CustomButton>
          </button>
          <button className="" onClick={deleteNode}>
            <CustomButton
              text={"Delete"}
              color={"#b91c1c"}
              Icon={Trash2}
            ></CustomButton>
          </button>
        </div>
      </NodeToolbar>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
      <div
        ref={nodeRef}
        className="w-20 h-20 bg-componentBg border-2 border-componentBorder rounded-sm"
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileInputChange}
          multiple
        />
        <div className="flex justify-center items-center h-full ">
          <Upload size={35} color="#7a4eea" />
        </div>
        {file != null && (
          <div>
            <div className="relative -top-[27px] right-[2px] text-right ">
              <FileCheck2 size={14} />
            </div>
            <div className="relative -top-5">
              <p className="text-white text-[12px] text-center font-medium ">
                {data?.label}
              </p>
            </div>
          </div>
        )}
        {file == null && (
          <div className="relative top-1">
            <p className="text-white text-[12px] text-center font-medium ">
              {data?.label}
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default RunNode;
