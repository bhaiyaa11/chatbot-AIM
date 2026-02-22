import React, { useState, useEffect } from "react";
import CreatableSelect from "react-select/creatable";
import { supabase } from "../../supabase";

function Videotype({onChange}) {

  const [Videotype, setVideotype] = useState([]);
  const [selectedVideotype, setSelectedVideoType] = useState(null);

  // Load table from Supabase
  const fetchVideotype = async () => {
    const { data, error } = await supabase
      .from("video_type")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) {
      const formatted = data.map(c => ({
        value: c.id,
        label: c.name
      }));
      setVideotype(formatted);
    }
  };

  useEffect(() => {
  fetchVideotype();
  }, []);

  // When selecting
  const handleChange = (option) => {
    setSelectedVideoType(option);
  const value = Array.isArray(option)
    ? option.map(o => o.label).join(", ")
    : option?.label ?? "";
  onChange?.(value);  // ← notify parent
  };


  // When creating new BU
  const handleCreate = async (inputValue) => {

    const { data, error } = await supabase
      .from("video_type")
      .insert([{ name: inputValue }])
      .select()
      .single();

  //   if (!error && data) {

  //     const newOption = {
  //       value: data.id,
  //       label: data.name
  //     };

  //     setVideotype(prev => [...prev, newOption]);
  //     setSelectedVideoType(newOption);
  //   }
  // };


    if (!error && data) {
      const newOption = { value: data.id, label: data.name };
      setVideotype(prev => [...prev, newOption]);
      setSelectedVideoType(newOption);
      onChange?.(newOption.label);  // ← notify parent on create too
    }
  };

  return (
    <form>
      <CreatableSelect
        placeholder="Video Type"
        options={Videotype}
        value={selectedVideotype}
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

export default Videotype;
