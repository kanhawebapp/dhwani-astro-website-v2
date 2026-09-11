"use client";
import { useState } from 'react';
// import Freereport from '../Smcompo/Freereport';
// import Recastro from '../Smcompo/Recastro';
import FAQue from '../FAQue';
import Callchatsec from '../Smcompo/Callchatsec';
import { useRouter } from "next/navigation";
import CustomInput from '../Custom/CustomInput';
import CustomButton from '../Custom/CustomButton';
import CustomSelect from '../Custom/CustomSelect';
import useScrollZoom from '@/Hooks/scrollZoom';



export default function Numerohome() {
    useScrollZoom(".head-wrap");
    const [formData, setFormData] = useState({
        name: '',
        day: '',
        month: '',
        year: '',
    });
    const currentYear = new Date().getFullYear();
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString());
    const years = Array.from({ length: currentYear - 1960 + 1 }, (_, i) => (currentYear - i).toString());
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleReset = () => {
        setFormData({
            name: '',
            day: '',
            month: '',
            year: '',
            type: 'Cheiro / Chaldean',
        });
    };

    const router = useRouter();
    const handleSubmit = (e) => {
        e.preventDefault();
     
        let monthNum = formData.month;
        if (isNaN(monthNum)) {
            const monthIndex = months.indexOf(formData.month);
           monthNum = monthIndex >= 0 ? monthIndex + 1 : '';

        }
        const params = new URLSearchParams({
            ...formData,
            month: monthNum
        }).toString();
        router.push(`/inKundli/getKundlipage/numerokundli`);
    };

    return (
        <section className="kundli-main-page py-5">
            <div className="kundli-page w-full md:max-w-7xl  justify-self-center flex flex-col gap-5 items-center justify-center ">
                <div className="text-black md:p-5 head-wrap bg-linear-to-r from-pink-100 to-yellow-100 shadow-lg rounded-lg p-5">
                    <h5 className="text-[#2f1254] text-xl sm:text-2xl text-center font-semibold">• About <strong>Numerology</strong> •</h5>
                    <p className="horo-p-mob text-black text-sm">
                        The divine technique of evaluating many parts of one's life and predicting the future using numbers is known as numerology. It basically builds a link between the frequency of these numbers and certain events that happen to a person. It also correlates numbers with English alphabets in order to decipher their numerological meaning and the impact of one's name, address, and other personal information on one's life.
                    </p>
                    <p className="horo-p-mob text-black text-sm">Everything in the Universe that occupies space has a frequency that can be measured in numbers. Finding out your governing number, destiny number, and life path number are all powerful numbers that can help you determine your fate. With the best Numerology predictions and expert counsel of our renowned Numerologists, you may eliminate the negative effects of any impediment in your path and live a beautiful life.</p>
                </div>

                <div className="kundli-sec-side-item w-full  flex flex-col">
                    <div className="text-black w-[70%] head-wrap mx-auto mt-2 p-4 bg-purple-100 border-2 border-purple-500 shadow-md rounded-md">
                        <h2 className="text-xl md:text-2xl text-center font-semibold mb-6">Get Ruling Number Predictions 1</h2>
                        <form onSubmit={handleSubmit}>

                            <CustomInput
                                label="Name"
                                type="text"
                                name="name"
                                placeholder="Enter Your Name "
                                value={formData.name}
                                onChange={handleChange}
                                bgredcolor="bg-purple-50"
                                className="border border-gray-300 placeholder:text-gray-600 rounded-full focus:outline-none focus:ring focus:border-purple-400 "
                                required
                            // error={formData.name === '' ? 'Name is required' : ''}
                            />

                            <div className="my-4">
                                <label className="block text-sm font-semibold mb-1">
                                    Date <span className="text-purple-600 font-bold">(DD/MM/YYYY) *</span>
                                </label>
                                <div className="flex space-x-2">
                                    <CustomSelect variant={"half"}
                                        name="day"
                                        value={formData.day}
                                        onChange={handleChange}
                                        options={["Day", ...days]}
                                        required
                                        className=""
                                    />
                                    <CustomSelect variant={"half"}
                                        name="month"
                                        value={formData.month}
                                        onChange={handleChange}
                                        options={["Month", ...months]}
                                        required
                                        className=" "
                                    />
                                    <CustomSelect variant={"half"}
                                        name="year"
                                        value={formData.year}
                                        onChange={handleChange}
                                        options={["Year", ...years]}
                                        required
                                        className=""
                                    />
                                </div>
                        
                            </div>

                            <div className="flex space-x-4 justify-center">
                                <CustomButton aria-label="Submit Ruling Number Predictions" type="submit" variant={"purple"} className='p-2'>
                                    SUBMIT
                                </CustomButton>
                                <CustomButton aria-label="Reset Ruling Number Predictions" type="button" onClick={handleReset} variant={"purple"} className='p-2'>
                                    RESET
                                </CustomButton>
                            </div>
                        </form>

                    </div>               

                </div>
            </div>

            {/* <Freereport /> */}
            {/* <Recastro /> */}
            <FAQue />
            <Callchatsec />
        </section>
    );
}







