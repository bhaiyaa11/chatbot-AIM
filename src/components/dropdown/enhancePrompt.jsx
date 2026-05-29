import { useState } from "react";

const API_BASE_URL = "http://localhost:8000";
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function EnhancePromptButton({

input,
setInput,

selectedClient,
selectedBU,
selectedVideoType,
selectedVideoTone,
selectedDuration,
sliderValue,

}) {

const [loading,setLoading]
=
useState(false);

const enhance =
async()=>{

if(!input.trim())
return;

setLoading(true);

try{

const finalPrompt = `

Client:
${selectedClient || "Not specified"}

Business Unit:
${selectedBU || "Not specified"}

Video Type:
${selectedVideoType || "Not specified"}

Tone:
${selectedVideoTone || "Professional"}

Duration:
${selectedDuration || "Not specified"}

Creativity:
${sliderValue}/100

User Request:
${input}

`;

const fd =
new FormData();

fd.append(
"prompt",
finalPrompt
);

const res =
await fetch(
`${API_BASE_URL}/enhance`,
{
method:"POST",
body:fd
}
);

const data =
await res.json();

if(
data.success
){

setInput(
data.enhanced
);

}

}catch(err){

console.error(
err
);

}

finally{

setLoading(
false
);

}

};

return(

<button
className="btn-enhance"

disabled={
loading
||
!input.trim()
}

onClick={
enhance
}

>

{
loading
?
"✨ Enhancing..."
:
"✨ Enhance"
}

</button>

);

}

