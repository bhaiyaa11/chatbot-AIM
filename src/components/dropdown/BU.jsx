import React, { useState, useEffect } from "react";
import CreatableSelect from "react-select/creatable";
import { supabase } from "../../supabase";

function Business_Unit({onChange}) {

  const [Business_Unit, setBusniess_Unit] = useState([]);
  const [selectedBusiness_Unit, setSelectedBusiness_unit] = useState(null);

  // Load BU from Supabase
  const fetchBusiness_Unit = async () => {
    const { data, error } = await supabase
      .from("business_unit")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) {
      const formatted = data.map(c => ({
        value: c.id,
        label: c.name
      }));
      setBusniess_Unit(formatted);
    }
  };

  useEffect(() => {
    fetchBusiness_Unit();
  }, []);

  // When selecting
  const handleChange = (option) => {
    setSelectedBusiness_unit(option);
      const value = Array.isArray(option)
    ? option.map(o => o.label).join(", ")
    : option?.label ?? "";
  onChange?.(value);  // ← notify parent
 
  };

  // When creating new BU
  const handleCreate = async (inputValue) => {

    const { data, error } = await supabase
      .from("business_unit")
      .insert([{ name: inputValue }])
      .select()
      .single();

  //   if (!error && data) {

  //     const newOption = {
  //       value: data.id,
  //       label: data.name
  //     };

  //     setBusniess_Unit(prev => [...prev, newOption]);
  //     setSelectedBusiness_unit(newOption);
  //   }
  // };

    if (!error && data) {
      const newOption = { value: data.id, label: data.name };
      setBusniess_Unit(prev => [...prev, newOption]);
      setSelectedBusiness_unit(newOption);
      onChange?.(newOption.label);  // ← notify parent on create too
    }
  };

  return (
    <form> 
      <CreatableSelect
        placeholder="Business Unit"
        options={Business_Unit}
        value={selectedBusiness_Unit}
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

export default Business_Unit;
