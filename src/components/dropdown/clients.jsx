import React, { useState, useEffect } from "react";
import CreatableSelect from "react-select/creatable";
import { supabase } from "../../supabase";

function Clients({onChange}) {

  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);

  // Load clients from Supabase
  const fetchClients = async () => {
    const { data, error } = await supabase
      .from("client")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) {
      const formatted = data.map(c => ({
        value: c.id,
        label: c.name
      }));
      setClients(formatted);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  // When selecting
  const handleChange = (option) => {
    setSelectedClient(option);
    const value = Array.isArray(option)
    ? option.map(o => o.label).join(", ")
    : option?.label ?? "";
    onChange?.(value);  // ← notify parent
    // onChange?.(option?.label ?? "");  // ← notify parent
  };

  // When creating new client
  const handleCreate = async (inputValue) => {

    const { data, error } = await supabase
      .from("client")
      .insert([{ name: inputValue }])
      .select()
      .single();

  //   if (!error && data) {

  //     const newOption = {
  //       value: data.id,
  //       label: data.name
  //     };

  //     setClients(prev => [...prev, newOption]);
  //     setSelectedClient(newOption);
  //   }
  // };

    if (!error && data) {
      const newOption = { value: data.id, label: data.name };
      setClients(prev => [...prev, newOption]);
      setSelectedClient(newOption);
      onChange?.(newOption.label);  // ← notify parent on create too
    }
  };

  return (
    <form>
      <CreatableSelect
        placeholder="Client"
        options={clients}
        value={selectedClient}
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

export default Clients;
