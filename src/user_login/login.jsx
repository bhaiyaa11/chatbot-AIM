import { useState } from "react";
import { supabase } from "../supabase";
import 'mdb-react-ui-kit/dist/css/mdb.min.css';
import {
  MDBBtn,
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBIcon,
  MDBInput,
} from "mdb-react-ui-kit";

const ALLOWED_DOMAIN = "allinmotion.com"; // change later

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setError(null);
      setLoading(true);

      if (!email.endsWith(`@${ALLOWED_DOMAIN}`)) {
        setError("Only company email addresses are allowed.");
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // ✅ DO NOTHING ELSE
      // App.jsx + AuthContext will switch to ChatContainer
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MDBContainer fluid>
      <MDBRow>
        {/* LEFT SIDE */}
        <MDBCol sm="6">
          <div className="d-flex flex-row ps-5 pt-5 align-items-center">
            <MDBIcon fas icon="crow fa-3x me-3" style={{marginTop:"40%"}} />
            <span className="h1 fw-bold mb-0" style={{ color: "#2d8cdf" }}>Welcome Back!</span>
          </div>

          <div className="d-flex flex-column justify-content-center h-custom-2 w-75 pt-4 ps-5">
            <h3 className="fw-normal mb-4" style={{ letterSpacing: "1px" ,  color: "#2d8cdf"}}>
              Log in
            </h3>

            <MDBInput
              wrapperClass="mb-4"
              label="Email address"
              type="email"
              size="lg"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <MDBInput
              wrapperClass="mb-4"
              label="Password"
              type="password"
              size="lg"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <MDBBtn
              className="mb-4"
              color="info"
              size="lg"
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? "Signing in..." : "Login"}
            </MDBBtn>

            {error && <p style={{ color: "red" }}>{error}</p>}

          </div>
        </MDBCol>

        {/* RIGHT SIDE IMAGE */}
        <MDBCol sm="6" className="d-none d-sm-block px-0">
          <img
            src="51501-24-AiM-LOGO_Colour.jpg"
            alt="Login visual"
            className="w-100"
            style={{ objectFit: "cover", objectPosition: "center", marginTop: "35%" }}
          />
        </MDBCol>
      </MDBRow>
    </MDBContainer>
  );
}

