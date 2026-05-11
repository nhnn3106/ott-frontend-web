import React, { useState } from "react";
import { X, Plus, Trash2, ListChecks } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

interface CreatePollModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    question: string;
    options: { id: string; name: string; voters: string[] }[];
    multipleChoice: boolean;
  }) => void;
}

const CreatePollModal: React.FC<CreatePollModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState([
    { id: uuidv4(), value: "" },
    { id: uuidv4(), value: "" },
  ]);
  const [multipleChoice, setMultipleChoice] = useState(false);

  const handleAddOption = () => {
    setOptions([...options, { id: uuidv4(), value: "" }]);
  };

  const handleRemoveOption = (id: string) => {
    if (options.length <= 2) return;
    setOptions(options.filter((opt) => opt.id !== id));
  };

  const handleOptionChange = (id: string, value: string) => {
    setOptions(
      options.map((opt) => (opt.id === id ? { ...opt, value } : opt)),
    );
  };

  const isFormValid =
    question.trim().length > 0 &&
    options.filter((opt) => opt.value.trim().length > 0).length >= 2;

  const handleSubmit = () => {
    if (!isFormValid) return;

    const validOptions = options
      .filter((opt) => opt.value.trim().length > 0)
      .map((opt) => ({ id: opt.id, name: opt.value.trim(), voters: [] }));

    onSubmit({
      question: question.trim(),
      options: validOptions,
      multipleChoice,
    });

    handleClose();
  };

  const handleClose = () => {
    setQuestion("");
    setOptions([
      { id: uuidv4(), value: "" },
      { id: uuidv4(), value: "" },
    ]);
    setMultipleChoice(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 animate-fade-in p-4 font-body">

      {/* Modal Container: Thu gọn width một chút, viền mỏng hơn */}
      <div className="flex w-full max-w-[420px] flex-col overflow-hidden rounded-2xl bg-surface shadow-xl animate-scale-in">

        {/* Header: Nền trắng hoàn toàn, viền dưới mỏng nhạt */}
        <div className="flex items-center justify-between border-b border-primary-50 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="text-primary-500">
              <ListChecks size={20} strokeWidth={2.5} />
            </div>
            <h2 className="text-[17px] font-semibold text-primary-900">
              Tạo bình chọn
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="rounded-full p-1.5 text-primary-300 hover:bg-primary-50 hover:text-primary-600 transition-fast"
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">

          <div className="mb-5">
            <textarea
              className="w-full resize-none rounded-xl border border-primary-100 bg-surface px-4 py-3 text-[15px] text-primary-900 placeholder:text-primary-300 outline-none transition-base focus:border-primary-400 focus:ring-1 focus:ring-primary-400"
              placeholder="Bạn muốn hỏi mọi người điều gì?"
              rows={2}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
          </div>

          <div className="mb-2">
            <div className="flex flex-col gap-2.5">
              {options.map((opt, index) => (
                <div key={opt.id} className="relative flex items-center group">
                  <input
                    type="text"
                    className="w-full rounded-xl border border-primary-100 bg-surface px-4 py-2.5 text-[14px] text-primary-900 placeholder:text-primary-300 outline-none transition-base focus:border-primary-400 focus:ring-1 focus:ring-primary-400 pr-10"
                    placeholder={`Lựa chọn ${index + 1}`}
                    value={opt.value}
                    onChange={(e) => handleOptionChange(opt.id, e.target.value)}
                  />
                  {options.length > 2 && (
                    <button
                      onClick={() => handleRemoveOption(opt.id)}
                      className="absolute right-2 p-1.5 text-primary-200 opacity-0 group-hover:opacity-100 hover:text-error-text transition-fast"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {options.length < 10 && (
              <button
                onClick={handleAddOption}
                className="mt-3 flex items-center gap-1.5 text-[13px] font-medium text-primary-500 hover:text-primary-700 transition-fast w-fit"
              >
                <Plus size={16} strokeWidth={2} />
                Thêm lựa chọn
              </button>
            )}
          </div>

          {/* Toggle Setting: Bỏ hẳn khối background màu, chỉ để dạng list item clean */}
          <label className="mt-6 flex items-center justify-between py-2 cursor-pointer group">
            <span className="text-[14px] font-medium text-primary-800">
              Cho phép chọn nhiều đáp án
            </span>
            <div className="relative inline-block w-10 h-5">
              <input
                type="checkbox"
                className="peer sr-only"
                checked={multipleChoice}
                onChange={(e) => setMultipleChoice(e.target.checked)}
              />
              <div className="w-10 h-5 bg-primary-100 rounded-full transition-colors peer-checked:bg-primary-500 group-hover:bg-primary-200 peer-checked:group-hover:bg-primary-600"></div>
              <div className="absolute top-[2px] left-[2px] bg-white rounded-full h-4 w-4 transition-transform peer-checked:translate-x-5 shadow-sm pointer-events-none"></div>
            </div>
          </label>
        </div>

        {/* Footer: Trắng, nút bấm thu nhỏ lại cho gọn */}
        <div className="flex justify-end gap-2 border-t border-primary-50 px-5 py-3.5">
          <button
            onClick={handleClose}
            className="px-4 py-2 rounded-lg text-primary-600 hover:bg-primary-50 transition-fast font-medium text-[14px]"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isFormValid}
            className={`px-5 py-2 rounded-lg font-medium text-[14px] transition-base ${isFormValid
              ? "bg-primary-500 text-white hover:bg-primary-600 shadow-sm"
              : "bg-primary-100 text-primary-400 cursor-not-allowed"
              }`}
          >
            Đăng
          </button>
        </div>

      </div>
    </div>
  );
};

export default CreatePollModal;
