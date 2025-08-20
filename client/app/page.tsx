import FileUploadComponent from "./components/file-upload";
import ChatComponent from "./components/chat";

export default function Home() {
  return (
    <div className="flex h-screen">
      <div className="w-[30%] border-r border-gray-200">
        <FileUploadComponent />
      </div>
      <div className="w-[70%]">
        <ChatComponent />
      </div>
    </div>
  );
}