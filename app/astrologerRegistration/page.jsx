"use client";

import { useState } from "react";
import { CREATE_APPLICATION, GET_ACTIVE_PROBLEMS, GET_ACTIVE_SKILLS } from "../graphql/gqlQuery";
import { useMutation, useQuery } from "@apollo/client/react";

export default function AstrologerRegistration() {
  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    name: "",
    dob: "",
    gender: "",
    languages: [],
    problems: [],
    skills: [],
    experience: "",
    email: "",
    phone: "",
    about: "",
    address: "",
    pincode: "",
  });

  const [createApplication, { loading, error }] =
    useMutation(CREATE_APPLICATION);

  // ------------------ handlers ------------------

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckbox = (field, value) => {
    setForm((prev) => {
      const exists = prev[field].includes(value);
      return {
        ...prev,
        [field]: exists
          ? prev[field].filter((v) => v !== value)
          : [...prev[field], value],
      };
    });
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const validate = () => {
    let newErrors = {};

    if (!form.name) newErrors.name = "Name is required";
    if (!form.dob) newErrors.dob = "DOB is required";
    if (!form.gender) newErrors.gender = "Gender is required";
    if (form.languages.length === 0) newErrors.languages = "Select at least one language";
    if (form.problems.length === 0) newErrors.problems = "Select at least one problems";

    if (form.skills.length === 0) newErrors.skills = "Select at least one skill";
    if (!form.experience) newErrors.experience = "Experience required";
    if (!form.phone) newErrors.phone = "Phone required";
    if (!form.address) newErrors.address = "Address required";

    // Optional: strict validation
    if (form.pincode && !/^\d{6}$/.test(form.pincode)) {
      newErrors.pincode = "Invalid pincode";
    }

    if (form.phone && !/^\d{10}$/.test(form.phone)) {
      newErrors.phone = "Invalid phone";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;

    if (Object.keys(newErrors).length > 0) {
      const first = Object.keys(newErrors)[0];
      document.querySelector(`[name="${first}"]`)?.focus();
    }
  };
  const { data: skillsData } = useQuery(GET_ACTIVE_SKILLS);

const { data: problemsData } = useQuery(GET_ACTIVE_PROBLEMS);
const skillOptions =
  skillsData?.getActiveSkills?.map((x) => x.name) || [];

const problemOptions =
  problemsData?.getActiveProblems?.map((x) => x.name) || [];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      await createApplication({
        variables: {
          input: {
            name: form.name,
            phoneNumber: form.phone,
            dob: new Date(form.dob).toISOString(),
            gender: form.gender,
            languages: form.languages,
            problems: form.problems,
            skills: form.skills,
            experience: Number(form.experience),
            about: form.about,
            address: form.address,

            ...(form.email && { email: form.email }),
            ...(form.pincode && { pincode: form.pincode }),
          }
        },
      });

      alert("Application Submitted 🚀");

      setForm({
        name: "",
        dob: "",
        gender: "",
        languages: [],
        problems: [],
        skills: [],
        experience: "",
        email: "",
        phone: "",
        about: "",
        address: "",
        pincode: "",
      });

      setErrors({});
      setPreview(null);
    } catch (err) {
      alert(err.message || "Submission failed");
    }
  };

  // ------------------ UI ------------------

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex items-center justify-center p-6">
      <div className="w-full max-w-5xl bg-white shadow-xl rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-center mb-6 text-black">
          Astrologer Registration
        </h2>




        <form onSubmit={handleSubmit} className="space-y-6 text-black">

          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Name"
              name="name" required
              value={form.name}
              onChange={handleChange}
              error={errors.name}
            />
            <Input
              label="Date of Birth"
              name="dob"
              type="date" required
              value={form.dob}
              onChange={handleChange}
              error={errors.dob}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">


            <div>
              <label className="block mb-2 font-medium">
                Gender <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-6">
                {["MALE", "FEMALE", "OTHER"].map((g) => (
                  <label key={g} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="gender"
                      value={g} required
                      checked={form.gender === g}
                      onChange={handleChange}
                      className="accent-indigo-500"
                    />
                    {g}
                  </label>
                ))}
              </div>
              {errors.gender && (
                <p className="text-red-500 text-xs mt-1">{errors.gender}</p>
              )}
            </div>

            <Input
              label="Experience (years)"
              name="experience"
              type="number" required value={form.experience}
              onChange={handleChange}
              error={errors.experience}
            />
          </div>



          <MultiSelect
            label="Languages"
            field="languages" required
            selected={form.languages}
            options={["English", "Hindi", "Gujarati", "Tamil", "Punjabi","Telugu","Kannada","Sanskrit","Bangla", "Others"]}
            handleCheckbox={handleCheckbox}
            error={errors.languages}
          />

        <MultiSelect
  label="Handle Problems"
  field="problems"
  selected={form.problems}
  options={problemOptions}
  handleCheckbox={handleCheckbox}
  error={errors.problems}
/>

    <MultiSelect
  label="Skills"
  field="skills"
  selected={form.skills}
  options={skillOptions}
  handleCheckbox={handleCheckbox}
  error={errors.skills}
/>



          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
            />
            <Input
              label="Phone"
              name="phone"
              type="tel" required
              value={form.phone}
              onChange={handleChange}
              error={errors.phone}
            />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Address"
              name="address" required
              type="text"
              value={form.address}
              onChange={handleChange}
              error={errors.address}
            />
            <Input
              label="Pincode"
              name="pincode"
              type="tel"
              value={form.pincode}
              onChange={handleChange}
            />
          </div>


          <div>
            <label className="block mb-2 font-medium">About Yourself</label>
            <textarea
              name="about"
              value={form.about}
              onChange={handleChange}
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-1 focus:ring-indigo-400 outline-none"
              rows="4"
            />
          </div>


          {error && (
            <p className="text-red-500 text-sm">
              {error.message || "Something went wrong"}
            </p>
          )}


          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl text-white transition ${loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700"
              }`}
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
}


function Input({ label, name, value, onChange, type = "text", error, required }) {
  return (
    <div>
      <label className="block mb-2 font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        className={`w-full p-3 rounded-xl outline-none border ${error ? "border-red-500" : "border-gray-200"
          }`}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}


function MultiSelect({
  label,
  options,
  field,
  selected,
  handleCheckbox,
  error,
  required
}) {
  return (
    <div>
      <label className="block mb-2 font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div
        className={`grid grid-cols-2 gap-2 rounded-xl p-3 border ${error ? "border-red-500" : "border-gray-200"
          }`}
      >
        {options.map((opt) => (
          <label key={opt} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selected.includes(opt)}
              onChange={() => handleCheckbox(field, opt)}
              className="accent-indigo-500"
            />
            {opt}
          </label>
        ))}
      </div>

      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}