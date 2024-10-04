import React, { useRef, useCallback, useState, useEffect } from "react";
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  useReactFlow,
  MiniMap,
  Background,
  Panel,
} from "reactflow";
import "reactflow/dist/style.css";
import { Play, Save, Trash2 } from "lucide-react";
import WorkflowSideBar from "../components/workflow/WorkflowSideBar";
import CodeNode from "../components/workflow/CodeNode";
import toast from "react-hot-toast";
import CustomButton from "../components/buttons/CustomButton";
import RunNode from "../components/workflow/RunNode";
import FinishNode from "../components/workflow/FinishNode";
import EditWorkflowButton from "../components/buttons/EditWorkflowButton";
import UploadNode from "../components/workflow/UploadNode";
import {
  getLocalStorageItemByName,
  getSession,
} from "../services/sessionService";
import {
  cloningWorkflow,
  createWorkflow,
  deleteWorkflow,
  deleteWorkflowVersionByIdandName,
  fetchWorkflows,
  updateWorkflow,
  updateWorkflowName,
  upgradeWorkflow,
} from "../api/workflow";
import { executePipeline, executeProgram } from "../api/programs";
const initialNodes = [];

const nodeTypes = {
  "code-node": CodeNode,
  "run-node": RunNode,
  "finish-node": FinishNode,
  "upload-node": UploadNode,
};

let id = 0;
const getId = () => `dndnode_${id++}`;

const DnDFlow = () => {
  const [selectedVersion, setSelectedVersion] = useState("");
  const [versions, setVersions] = useState([]);

  const [workflowResults, setWorkflowResults] = useState([]); 


  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { screenToFlowPosition } = useReactFlow();
  const [rfInstance, setRfInstance] = useState<typeof ReactFlow | null>(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState<
    IWorkflow | undefined
  >();
  const username = getLocalStorageItemByName("username");
  const [workflowName, setWorkflowName] = useState(
    (selectedWorkflow && selectedWorkflow.name) || "Untitled Workflow"
  );
  const [selectedKey, setSelectedKey] = useState(0);

  const [workflows, setWorkflows] = useState<any[]>([]);
  const handleChange = (e) => {
    setWorkflowName(e.target.value);
  };
  var isAnyWorkflow = workflows.length > 0 ? true : false;

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      const updatedWorkflows = workflows.map((workflow, index) => {
        if (index === selectedKey) {
          return { ...workflow, name: workflowName };
        }
        return workflow;
      });
      setWorkflows(updatedWorkflows);
      onSaveName();
    }
  };

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const type = event.dataTransfer.getData("application/reactflow");
      const nodeName = event.dataTransfer.getData(
        "application/reactflow/node/name"
      );

      if (typeof type === "undefined" || !type) {
        return;
      }

      if (type === "code-node") {
        const codeData = event.dataTransfer.getData(
          "application/reactflow/codeData"
        );

        console.log(codeData);
        const position = screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });
        const newNode = {
          id: getId(),
          type,
          position,
          data: { label: `${nodeName}`, codeData: JSON.parse(codeData) },
        };
        setNodes((nds) => nds.concat(newNode));
      } else {
        const position = screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });
        const newNode = {
          id: getId(),
          type,
          position,
          data: { label: `${nodeName}` },
        };

        setNodes((nds) => nds.concat(newNode));
      }
    },
    [screenToFlowPosition]
  );
  const onConnect = useCallback(
    (params) => {
      const { source, target } = params;

      const targetHasInput = edges.some((edge) => edge.target === target);

      const sourceHasOutput = edges.some((edge) => edge.source === source);

      if (!targetHasInput && !sourceHasOutput) {
        setEdges((eds) => addEdge(params, eds));
      } else {
        toast.error("Nodes can only have one input and one output.");
      }
    },
    [edges, setEdges]
  );

  const onNodesDelete = useCallback(
    (nodesToDelete) => {
      // Extract IDs of nodes to delete
      const nodeIdsToDelete = nodesToDelete.map((node) => node.id);

      // Filter out deleted nodes from the nodes state
      setNodes((nds) =>
        nds.filter((node) => !nodeIdsToDelete.includes(node.id))
      );

      // Filter out edges connected to deleted nodes
      setEdges((eds) =>
        eds.filter(
          (edge) =>
            !nodeIdsToDelete.includes(edge.source) &&
            !nodeIdsToDelete.includes(edge.target)
        )
      );
    },
    [setNodes, setEdges]
  );
  const onSave = async () => {
    if (rfInstance) {
      const flow = rfInstance.toObject();
      const content = { content: flow };
      try {
        const sessionToken = getSession();
        const update = await updateWorkflow(
          sessionToken,
          selectedWorkflow?._id ?? "",
          content
        );
        onSaveName();
        toast.success("workflow updated successfully");
        window.location.href = "";
      } catch (error) {
        toast.error("error while updating workflow");
      }
      toast.success(`${workflowName} updated successfully`);
    }
  };
  const onSaveName = async () => {
    const content = { name: workflowName };
    try {
      const sessionToken = getSession();
      const update = await updateWorkflowName(
        sessionToken,
        selectedWorkflow?._id ?? "",
        content
      );
    } catch (error) {
      toast.error("error while updating workflow");
    }
    toast.success(`${workflowName} updated`);
  };

  const onSaveUpgrade = async () => {
    if (rfInstance) {
      const flow = rfInstance.toObject();
      const content = { content: flow };
      try {
        const sessionToken = getSession();
        const upgrade = await upgradeWorkflow(
          sessionToken,
          selectedWorkflow?._id ?? "",
          content
        );
        onSaveName();
        toast.success("workflow upgraded successfully");
        window.location.href = "";
      } catch (error) {
        toast.error("error while upgrading workflow");
      }
      toast.success(`${workflowName} upgraded successfully`);
    }
  };
  const runWorkflow = async () => {
    const startNode = nodes.find((node) => node.type === "run-node");
    const endNode = nodes.find((node) => node.type === "finish-node");

    if (!startNode || !endNode) {
      toast.error("Workflow must have a start node and finish node.");
      return;
    }

    const nodeNames = [];
    const codeNodeDetails = []; // Array to store details of code nodes
    let currentNode = startNode;

    while (currentNode) {
      nodeNames.push(currentNode.data.label);

      // Check if the current node is a code-node and extract the details
      if (currentNode.type === "code-node") {
        const { language, outputFileType } = currentNode.data.codeData;
        const code = currentNode.data.codeData.content; // Extract code from content property
        codeNodeDetails.push({ language, code, outputFileType });
      }

      const nextEdge = edges.find((edge) => edge.source === currentNode.id);
      if (!nextEdge) break;
      currentNode = nodes.find((node) => node.id === nextEdge.target);

      if (currentNode && currentNode.type === "finish-node") {
        nodeNames.push(currentNode.data.label);
        break;
      }
    }

    if (currentNode && currentNode.type === "finish-node") {
      // toast.success(`Workflow: ${nodeNames.join(" -> ")}`);
      toast.success(`Workflow Running ...`);

      // Prepare FormData for each code node detail
      const token = getSession();
      for (const element of codeNodeDetails) {
        const formData = new FormData();
        formData.append("language", element.language);
        formData.append("code", element.code);
        formData.append("outputFileType", element.outputFileType);

        try {
          const result = await executePipeline(token, formData);

          if (element.outputFileType == "void") {
            setWorkflowResults((prevResults) => [...prevResults, { type: 'text', content: result }]); // Storing output
            toast.success("Le code a été exécuté avec succès.", {
              duration: 1000,
            });
          } else {
            const url = window.URL.createObjectURL(result);
            setWorkflowResults((prevResults) => [...prevResults, { type: 'file', content: url }]); // Storing file URL
            toast.success("File fetched");
          }
        } catch (error) {
          toast.error("Error executing program.");
          console.error(error);
        }
      }

      console.log("Code Node Details:", codeNodeDetails); // Log or use the codeNodeDetails as needed
    } else {
      toast.error("Workflow does not end with a finish node.");
    }
  };
  const downloadFile = (url, index) => {
    if (url) {
      const link = document.createElement("a");
      link.href = url;
      // link.download = "output." + outputType; // Dynamically set the file extension

      link.download = `output_${index}.jpg`;  // Use the index to name the file
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);  // Revoke the URL after downloading
    }
  };


  const selectWorkflow = (workflow, key) => {
    setSelectedWorkflow(workflow);
    console.log(workflow);
    setSelectedKey(key);
    setWorkflowName(workflow.name);
    restoreFlow(workflow.versions[workflow.versions.length - 1].content);
    setSelectedVersion(workflow.versions[workflow.versions.length - 1].name);
    setVersions(workflow.versions);
  };

  const selectVersion = (e, version) => {
    setSelectedVersion(version.name);
    console.log(version.content);
    restoreFlow(version.content);
  };

  const restoreFlow = async (flow: any) => {
    if (flow) {
      setNodes(flow.nodes || []);
      setEdges(flow.edges || []);
    }
  };
  useEffect(() => {
    const fetchWorkflow = async () => {
      try {
        const sessionToken = getSession();

        if (sessionToken) {
          const programsData = await fetchWorkflows(sessionToken);
          setWorkflows(programsData);

          if (programsData.length > 0) {
            selectWorkflow(programsData[0], 0);
          } else {
            console.log("No workflows available");
          }
        } else {
          console.error("Error fetching workflows");
        }
      } catch (error) {
        console.error("Error fetching workflows:", error);
      }
    };

    fetchWorkflow();
  }, []);

  const deleteVersion = async (versionName: any) => {
    try {
      const sessionToken = getSession();
      const update = await deleteWorkflowVersionByIdandName(
        sessionToken,
        selectedWorkflow?._id ?? "",
        versionName
      );
      toast.success("version deleted successfully");
      window.location.href = "";
    } catch (error) {
      toast.error("error while updating workflow");
    }
  };

  const deleteWorkflowByID = async () => {
    try {
      const sessionToken = getSession();
      const update = await deleteWorkflow(
        sessionToken,
        selectedWorkflow?._id ?? ""
      );
      toast.success("workflow deleted successfully");
      window.location.href = "";
    } catch (error) {
      toast.error("error while deleting workflow");
    }
  };

  const createWorkflows = async () => {
    if (rfInstance) {
      const flow = rfInstance.toObject();
      const content = { name: "Untitled Workflow", content: flow };
      try {
        const sessionToken = getSession();
        const create = await createWorkflow(sessionToken, content);
        toast.success("workflow created successfully");
        window.location.href = "";
      } catch (error) {
        toast.error("error while creating workflow");
      }
    }
  };

  const cloneWorkflow = async () => {
    if (rfInstance) {
      const flow = rfInstance.toObject();
      const content = { name: selectedWorkflow.name + " clone", content: flow };
      try {
        const sessionToken = getSession();
        const create = await cloningWorkflow(sessionToken, content);
        toast.success("workflow cloning successfully");
        window.location.href = "";
      } catch (error) {
        toast.error("error while cloning workflow");
      }
    }
  };
  // const initializeNodes = () => {
  //   setNodes(initialNodes);
  // };
  const handleKeyPress = (event) => {
    // This will log the key pressed to the console
    if(event.key == "o"){
      toast.success("Workflow Running...")
    }
  };
  return (
    <div tabIndex={0} onKeyDown={handleKeyPress} className="mt-20 mx-4 outline-none">
      {isAnyWorkflow && (
        <div className="flex mb-2 gap-2">
          <input
            className="font-medium rounded px-2 outline-none "
            type="text"
            value={workflowName}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
          />
          <details className="dropdown ">
            <summary className="btn px-2 min-h-0 h-6 ">
              {selectedVersion}
            </summary>
            <ul className="menu dropdown-content bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
              {versions.map((version) => (
                <li className="flex flex-row " key={version.name}>
                  <a
                    className="flex-1"
                    onClick={(e) => selectVersion(e, version)}
                  >
                    Version {version.name}
                  </a>
                  <div
                    className="flex items-center justify-center"
                    onClick={() => deleteVersion({ versionName: version.name })}
                  >
                    <Trash2 color="white" size={16}></Trash2>
                  </div>
                </li>
              ))}
            </ul>
          </details>
          <summary
            className="btn px-2 min-h-0 h-6 "
            onClick={() => createWorkflows()}
          >
            Create Workflow
          </summary>
      
        </div>
      )}
      {!isAnyWorkflow && (
        <summary
          className="btn mb-2 px-2 min-h-0 h-6 "
          onClick={() => createWorkflows()}
        >
          Create Workflow
        </summary>
      )}
      <div>
      {/* Rendu de la liste fusionnée */}
      {workflowResults.length > 0 && (
        <div className="flex flex-col">
          {workflowResults.map((item, index) => (
            item.type === 'file' ? (
              <p
                key={index}
                onClick={() => downloadFile(item.content, index)}
                style={{ textDecoration: "underline" }}
                className="font-medium cursor-pointer text-accentColor hover:text-accentColorHover"
              >
                {index + 1 + ')'} Download file 
              </p>
            ) : (
              <p key={index} className="font-medium">
                {index + 1 + ')'} {item.content}
              </p>
            )
          ))}
        </div>
      )}
    </div>
      <div className="flex gap-2">
        <WorkflowSideBar
          workflows={workflows}
          selectedKey={selectedKey}
          selectWorkflow={selectWorkflow}
        />
        <div
          className="border-2 rounded-lg border-componentBorder bg-componentBg"
          style={{ width: "80vw", height: "89vh" }}
          ref={reactFlowWrapper}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onNodesDelete={onNodesDelete}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
            onInit={setRfInstance}
            onDragOver={onDragOver}
            fitView
          >
            <MiniMap />
            <Panel className="flex gap-1" position="bottom-center">
              <div onClick={runWorkflow}>
                <CustomButton
                  color={"#355cc9"}
                  Icon={Play}
                  text={"Run Workflow"}
                />
              </div>
              <div onClick={onSave}>
                <CustomButton
                  color={"#22c55e "}
                  Icon={Save}
                  text={"Save"}
                ></CustomButton>
              </div>
              <div onClick={onSaveUpgrade}>
                <CustomButton
                  color={"#16a34a"} // Vert foncé pour "Upgrade Version"
                  Icon={Save}
                  text={"Upgrade Version"}
                ></CustomButton>
              </div>
              <div onClick={cloneWorkflow}>
                <CustomButton
                  color={"#3b82f6"} // Bleu clair pour "Clone"
                  Icon={Save}
                  text={"Clone"}
                ></CustomButton>
              </div>
              <div onClick={deleteWorkflowByID}>
                <CustomButton
                  color={"#b91c1c"}
                  Icon={Trash2}
                  text={"Delete"}
                ></CustomButton>
              </div>
            </Panel>
            <Controls />
            <Background variant="dots" gap={16} size={1} />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
};

export default () => (
  <ReactFlowProvider>
    <DnDFlow />
  </ReactFlowProvider>
);
