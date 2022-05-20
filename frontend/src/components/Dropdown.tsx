import React, { useState } from "react";

export type DropdownProps = {
  label: string;
  items: string[];
  onSelect: (item: string) => void;
  selected?: string;
};

export const Dropdown = ({
  label,
  items,
  onSelect,
  selected,
}: DropdownProps) => {
  const [expanded, setExpanded] = useState<boolean>(false);

  const handleSelect = (item: string) => {
    onSelect(item)
    setExpanded(false)
  }

  return (
    <div className="relative inline-block text-left">
      <div>
        <button
          type="button"
          className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500"
          id="menu-button"
          aria-expanded="true"
          aria-haspopup="true"
          onClick={() => setExpanded(!expanded)}
        >
          {label}
          <svg
            className="-mr-1 ml-2 h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fill-rule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
      </div>
      {expanded && (
        <div
          className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="menu-button"
          tabIndex={-1}
        >
          <div className="py-1" role="none">
            {items.map((item) => {
              return (
                <button
                  key={item}
                  className={`${
                    selected ? "text-gray-900" : "text-gray-700"
                  } block px-4 py-2 text-sm hover:bg-gray-100 w-full text-left`}
                  role="menuitem"
                  tabIndex={-1}
                  id="menu-item-0"
                  onClick={() => handleSelect(item)}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
