import React, { useState, useEffect } from "react";
import CreatableSelect from "react-select/creatable";
import { supabase } from "../../supabase";

function VideoTone({onChange}) {

  const [VideoTone, setVideoTone] = useState([]);
  const [selectedVideoTone, setSelectedVideoTonee] = useState(null);

  // Load table from Supabase
  const fetchVideoTone = async () => {
    const { data, error } = await supabase
      .from("video_tone")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) {
      const formatted = data.map(c => ({
        value: c.id,
        label: c.name
      }));
      setVideoTone(formatted);
    }
  };

  useEffect(() => {
  fetchVideoTone();
  }, []);

  // When selecting
  const handleChange = (option) => {
    setSelectedVideoTonee(option);
      const value = Array.isArray(option)
    ? option.map(o => o.label).join(", ")
    : option?.label ?? "";
  onChange?.(value);  // ← notify parent

  };


  // When creating new BU
  const handleCreate = async (inputValue) => {

    const { data, error } = await supabase
      .from("video_tone")
      .insert([{ name: inputValue }])
      .select()
      .single();

  //   if (!error && data) {

  //     const newOption = {
  //       value: data.id,
  //       label: data.name
  //     };

  //     setVideoTone(prev => [...prev, newOption]);
  //     setSelectedVideoTonee(newOption);
  //   }
  // };

    if (!error && data) {
      const newOption = { value: data.id, label: data.name };
      setVideoTone(prev => [...prev, newOption]);
      setSelectedVideoTonee(newOption);
      onChange?.(newOption.label);  // ← notify parent on create too
    }
  };

  return (
    <form>
      <CreatableSelect
        placeholder="Video Tone"
        options={VideoTone}
        value={selectedVideoTone}
        onChange={handleChange}
        onCreateOption={handleCreate}
        isClearable
        isMulti
        styles={{
          control: (provided) => ({
            ...provided,
            borderRadius: "40px",
            backgroundColor: "black",
            color: "white",
            border: "1px solid #3a3a3a",
            boxShadow: "0 20px 20px rgb(64, 59, 59)",
          }),
        }}
      />
    </form>
  );
}

export default VideoTone;
