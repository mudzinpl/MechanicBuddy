'use client'

import { TrashIcon } from "@heroicons/react/24/outline";

export default function DeleteSocialButton() {
    return (
        <button
            type="submit"
            className="p-2 text-gray-400 hover:text-red-600"
            onClick={(e) => {
                if (!confirm('Czy na pewno chcesz usunąć ten link społecznościowy?')) {
                    e.preventDefault();
                }
            }}
        >
            <TrashIcon className="h-5 w-5" />
        </button>
    );
}
