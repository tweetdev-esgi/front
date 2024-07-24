import { Button, useToast } from "@chakra-ui/react";
import { Play } from "lucide-react";
import CustomButton from "../buttons/CustomButton";
import { executeProgram } from "../../api/programs";
import { useState } from "react";
import FileDownload from "./FileDownload";
import hotToast from "react-hot-toast"; // Rename the imported 'toast' variable
import { getSession } from "../../services/sessionService";

const RunCodeButton = ({
  editorRef,
  language,
  isLoading,
  setIsLoading,
  setIsError,
  setOutput,
  uploadedFile,
  inputType,
  outputType,
}) => {
  const toast = useToast();
  const [fileUrl, setFileUrl] = useState("");
  const [message, setMessage] = useState("");
  const token = getSession();
  const runCode = async () => {
    try {
      if (!editorRef.current) return;
      const sourceCode = editorRef.current.getValue();
      setIsLoading(true);

      const formData = new FormData();
      formData.append("language", language);
      formData.append("code", sourceCode);
      formData.append("inputFileType", inputType);
      formData.append("outputFileType", outputType);

      if (uploadedFile) {
        formData.append("file", uploadedFile);
      }

      const result = await executeProgram(token, formData);

      if (outputType === "void") {
        setOutput(result.split("\n"));
        hotToast.success("Le code a été exécuté avec succès.", {
          duration: 1000,
        });
        setIsError(!!result.stderr);
      } else {
        const url = window.URL.createObjectURL(result);
        setFileUrl(url);
        setMessage("Le fichier est prêt à être téléchargé.");
        hotToast.success("File fetched"); // Use the renamed 'hotToast' variable
        setIsError(false); // Set to false as the result is successful
      }
    } catch (error) {
      hotToast.error("Erreur lors de l'exécution du code." + error, {
        duration: 200,
      });
      console.error("Error executing code:", error);
      setMessage("Erreur lors de l'exécution du code.");
      toast({
        title: "An error occurred.",
        description: "Unable to run code",
        status: "error",
        duration: 6000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadFile = () => {
    if (fileUrl) {
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = "output." + outputType; // Dynamically set the file extension

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(fileUrl); // Révoquer l'URL pour libérer les ressources
    }
  };

  return (
    <div>
      <summary className="btn mb-2 px-2 min-h-0 h-6 " onClick={runCode}>
        Run Code
      </summary>
      <div>
        {message && <p>{message}</p>}
        {fileUrl && (
          <div
            onClick={downloadFile}
            style={{
              cursor: "pointer",
              color: "blue",
              textDecoration: "underline",
            }}
          >
            Cliquez ici pour télécharger le fichier
          </div>
        )}
      </div>
    </div>
  );
};

export default RunCodeButton;
