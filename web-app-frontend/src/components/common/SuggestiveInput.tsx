import React, { useEffect, useRef, useState } from 'react';
import { FormControl, ListGroup } from 'react-bootstrap';
import './SuggestiveInput.css';

export interface SuggestiveItem {
  key: string;
  value: string;
  data?: any;
}

export interface SuggestedItem {
  key?: string;
  value: string;
  data?: any;
}

interface SuggestiveInputProps {
  suggestions: SuggestiveItem[];
  maxSuggestions?: number;
  mode: 'strict' | 'free';
  itemsToScroll?: number;
  onFilter?: (input: string) => SuggestiveItem[];
  onChange: (value: SuggestedItem) => void;
  placeholder?: string
  required: boolean
  disabled?: boolean
  clarifyText?: string;
}

const SuggestiveInput: React.FC<SuggestiveInputProps> = ({
                                                           suggestions,
                                                           maxSuggestions = 5,
                                                           mode,
                                                           itemsToScroll = 5,
                                                           onFilter,
                                                           onChange,
                                                           placeholder,
                                                           required,
                                                           disabled,
                                                           clarifyText = 'Clarify request'
                                                         }) => {
  const [inputValue, setInputValue] = useState('');
  const [filteredSuggestions, setFilteredSuggestions] = useState<SuggestiveItem[]>(suggestions.slice(0, maxSuggestions));
  const [filteredSliced, setFilteredSliced] = useState(suggestions.length > filteredSuggestions.length);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [dropdownWidth, setDropdownWidth] = useState<number | undefined>(undefined);

  if (!onFilter) {
    onFilter = it => {
      const substring = it.toLowerCase();
      return suggestions.filter(it => it.value.includes(substring))
    }
  }

  useEffect(() => {
    if (inputRef.current) {
      setDropdownWidth(inputRef.current.offsetWidth);
    }
  }, [inputValue]);

  const handleValueChange = (value: string): SuggestiveItem[] => {
    setInputValue(value);

    const filtered = onFilter(value);
    const sliced = filtered.slice(0, maxSuggestions);
    setFilteredSuggestions(sliced);
    setFilteredSliced(filtered.length > sliced.length);
    return sliced;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const sliced = handleValueChange(value)

    setShowSuggestions(sliced.length > 0);

    if (sliced.length > 0) {
      const candidate = sliced[0];
      onChange({
        key: candidate.key,
        value: candidate.value,
        data: candidate.data
      })
    } else if (mode === 'free') {
      onChange({ value: value });
    } else {
      onChange({ value: '' });
    }
  };

  const handleSuggestionClick = (suggestion: SuggestiveItem) => {
    handleValueChange(suggestion.value);
    setShowSuggestions(false);
    onChange(suggestion);
  };

  const handleBlur = () => {
    setTimeout(() => setShowSuggestions(false), 200);
  };

  return (
    <>
      <FormControl
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => setShowSuggestions(filteredSuggestions.length > 0)}
        onBlur={handleBlur}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
      />
      {showSuggestions && (
        <div
          className="suggestions-dropdown"
          style={{ width: dropdownWidth }}
        >
          <ListGroup style={{ maxHeight: `${itemsToScroll * 32}px`, overflowY: 'auto' }}>
            {filteredSuggestions.map((suggestion) => (
              <ListGroup.Item
                key={suggestion.key}
                action
                onClick={() => handleSuggestionClick(suggestion)}
                className="suggestion-item"
              >
                {suggestion.value}
              </ListGroup.Item>
            ))}
            {filteredSliced && (
              <ListGroup.Item
                key={'other-options'}
                className="suggestion-text text-secondary"
              >
                {clarifyText}
              </ListGroup.Item>
            )}
          </ListGroup>
        </div>
      )}
    </>
  );
};

export default SuggestiveInput;
