"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Logo from "./slidefy_logo.png";

type Aula = {
  titulo: string;
  subtitulo: string;
  conteudo: string;
};

type AulasResponse = {
  [key: string]: Aula;
};

const UploadPage = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string>("");
  const [aulas, setAulas] = useState<AulasResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null); // Referência para o input do arquivo

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
      setMessage("");
      setAulas([]);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setMessage("");
    setAulas([]);

    // Limpa o valor do input de arquivo
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!selectedFile) {
      setMessage("Por favor, selecione um arquivo.");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("http://localhost:3001/openai/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      console.log(result);

      if (response.ok) {
        setAulas(result.aulas);
        setMessage("Apresentação criada com sucesso!");
      } else {
        setMessage(`Erro: ${result.message}`);
      }
    } catch {
      setMessage("Erro ao criar apresentação.");
    } finally {
      setLoading(false);
    }
  };

  const logoSlidefy = Logo;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-md rounded px-8 py-6 w-full max-w-md">
        <div className="flex justify-center mb-4">
          <Image
            src={logoSlidefy}
            alt="Logo Slidefy"
            width={200}
            height={200}
            className="object-contain"
          />
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <label className="block">
            <span className="sr-only">Escolher arquivo</span>
            <input
              type="file"
              onChange={handleFileChange}
              className="hidden"
              id="file-input"
              ref={fileInputRef} // Atribui a referência ao input
            />
            <label
              htmlFor="file-input"
              className="cursor-pointer w-full bg-[#1A8CE3] hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition duration-300 inline-block flex flex-row justify-center text-center"
            >
              {selectedFile ? (
                <div className="flex items-center space-x-4">
                  <span>{selectedFile.name}</span>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="text-[#FFFFFF]"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                "Escolher arquivo"
              )}
            </label>
          </label>

          <button
            type="submit"
            className="text-white bg-[#1A8CE3] hover:bg-blue-600 font-medium py-2 px-4 rounded-md transition duration-300 flex items-center justify-center space-x-2"
          >
            <p>Gerar slides</p>
            {loading && (
              <div className="animate-spin">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="23 4 23 10 17 10" />
                  <polyline points="1 20 1 14 7 14" />
                  <path d="M3.51 9a9 9 0 0114.38-4.63L23 10M1 14l5.1 5.1A9 9 0 0020.49 15" />
                </svg>
              </div>
            )}
          </button>
        </form>

        {message && (
          <p className="mt-4 text-center text-gray-600 bg-gray-100 p-2 rounded-md">
            {message}
          </p>
        )}

        {aulas.length > 0 && (
          <div className="mt-8">
            {aulas.map((aula, index) => {
              const aulaKey = Object.keys(aula)[0];
              const aulaData = aula[aulaKey];

              return (
                <div
                  key={index}
                  className="bg-white p-4 mb-4 border rounded shadow"
                >
                  <h2 className="text-xl font-medium">
                    {aulaData.titulo || "Sem título"}
                  </h2>
                  <h3 className="text-lg font-semibold">
                    {aulaData.subtitulo || "Sem subtítulo"}
                  </h3>
                  <p className="text-gray-700 mt-2">
                    {aulaData.conteudo || "Sem conteúdo"}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadPage;
