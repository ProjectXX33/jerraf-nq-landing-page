import React from 'react';
import { FormData, Gender, AgeUnit } from '../../types/growth-system';
import { UserIcon, GenderIcon, CalendarIcon, WeightIcon, HeightIcon } from './icons';

interface InputFormProps {
    childData: FormData;
    isLoading: boolean;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    onSubmit: (e: React.FormEvent) => void;
}

const InputForm: React.FC<InputFormProps> = ({ childData, isLoading, onInputChange, onSubmit }) => {
    return (
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-700 mb-6">بيانات الطفل</h2>
            <form onSubmit={onSubmit} className="space-y-6">
                 <div>
                    <label htmlFor="name" className="flex items-center text-md font-semibold text-gray-600 mb-2">
                        <UserIcon className="w-5 h-5 ml-2 text-amber-500" />
                        اسم الطفل
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={childData.name}
                        onChange={onInputChange}
                        className="w-full p-3 bg-gray-100 border-gray-200 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
                        placeholder="مثال: عُمر"
                        required
                    />
                </div>
                <div>
                    <label className="flex items-center text-md font-semibold text-gray-600 mb-2">
                        <GenderIcon className="w-5 h-5 ml-2 text-amber-500" />
                        الجنس
                    </label>
                    <div className="flex gap-4 bg-gray-100 p-1 rounded-lg">
                        <label className={`flex-1 text-center cursor-pointer p-2 rounded-md transition-colors duration-300 ${childData.gender === Gender.MALE ? 'bg-sky-400 text-white shadow' : 'hover:bg-sky-100'}`}>
                            <input
                                type="radio"
                                name="gender"
                                value={Gender.MALE}
                                checked={childData.gender === Gender.MALE}
                                onChange={onInputChange}
                                className="sr-only"
                            />
                            {Gender.MALE}
                        </label>
                        <label className={`flex-1 text-center cursor-pointer p-2 rounded-md transition-colors duration-300 ${childData.gender === Gender.FEMALE ? 'bg-pink-400 text-white shadow' : 'hover:bg-pink-100'}`}>
                            <input
                                type="radio"
                                name="gender"
                                value={Gender.FEMALE}
                                checked={childData.gender === Gender.FEMALE}
                                onChange={onInputChange}
                                className="sr-only"
                            />
                            {Gender.FEMALE}
                        </label>
                    </div>
                </div>

                <div>
                    <label htmlFor="age" className="flex items-center text-md font-semibold text-gray-600 mb-2">
                        <CalendarIcon className="w-5 h-5 ml-2 text-amber-500" />
                        العمر
                    </label>
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            id="age"
                            name="age"
                            value={childData.age}
                            onChange={onInputChange}
                            className="w-full p-3 bg-gray-100 border-gray-200 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
                            min="1"
                            placeholder="ادخل العمر"
                            required
                        />
                        <select
                            name="ageUnit"
                            value={childData.ageUnit}
                            onChange={onInputChange}
                            className="p-3 bg-gray-100 border-gray-200 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
                        >
                            <option value={AgeUnit.MONTHS}>{AgeUnit.MONTHS}</option>
                            <option value={AgeUnit.YEARS}>{AgeUnit.YEARS}</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label htmlFor="weight" className="flex items-center text-md font-semibold text-gray-600 mb-2">
                        <WeightIcon className="w-5 h-5 ml-2 text-amber-500" />
                        الوزن (كجم)
                    </label>
                    <input
                        type="number"
                        id="weight"
                        name="weight"
                        step="0.1"
                        value={childData.weight}
                        onChange={onInputChange}
                        className="w-full p-3 bg-gray-100 border-gray-200 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
                        min="1"
                        placeholder="مثال: 7.5"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="height" className="flex items-center text-md font-semibold text-gray-600 mb-2">
                        <HeightIcon className="w-5 h-5 ml-2 text-amber-500" />
                        الطول (سم)
                    </label>
                    <input
                        type="number"
                        id="height"
                        name="height"
                        value={childData.height}
                        onChange={onInputChange}
                        className="w-full p-3 bg-gray-100 border-gray-200 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
                        min="20"
                        placeholder="مثال: 65"
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-amber-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-amber-600 focus:outline-none focus:ring-4 focus:ring-amber-300 transition-all duration-300 ease-in-out disabled:bg-amber-300 disabled:cursor-not-allowed flex items-center justify-center"
                >
                    {isLoading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            جاري إنشاء التقرير...
                        </>
                    ) : (
                        'احصل على التقرير'
                    )}
                </button>
            </form>
        </div>
    );
};

export default InputForm; 