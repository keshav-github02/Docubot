'use client'
import * as React from 'react'
import { CloudUpload } from 'lucide-react'
import Navbar from './navbar'

const FileUploadComponent : React.FC = () => {

    const HandleFileUpload = () => {
        const el = document.createElement('input');
        el.setAttribute('type', 'file');
        el.setAttribute('accept', 'application/pdf');


        el.addEventListener('change',async (ev) => {
           if(el.files && el.files.length > 0) {
            const file = el.files.item(0)

            //send to backend
            if(file){
                const formData = new FormData()
                formData.append('pdf', file)

               await fetch('http://localhost:8000/upload/pdf', {
                    method:'POST',
                    body:formData
                });
            console.log("File is uploaded");

            }
           }
        })
        el.click();


    }
     return (
        <div className="flex flex-col h-screen">
            {/* Navbar */}
            <Navbar />
            
            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center p-4">
                <div className="bg-slate-900 text-white shadow-2xl flex justify-center items-center gap-2 p-4 rounded-lg cursor-pointer border-white border-2">
                    <div onClick={HandleFileUpload} className="flex flex-col items-center justify-center">
                        <h3>Upload PDF File</h3>            
                        <CloudUpload />
                    </div>
                </div>
            </div>
        </div>
     )
}

export default FileUploadComponent;