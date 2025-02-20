import React, { useState } from 'react';
import { Form, FormControl, ListGroup } from 'react-bootstrap';

interface SuggestiveInputProps {
  suggestions: string[];
  maxSuggestions?: number;
  mode: 'strict' | 'free';
  onFilter: (input: string) => string[];
  onChange: (value: string) => void;
}

const SuggestiveInput: React.FC<SuggestiveInputProps> = ({
                                                           suggestions,
                                                           maxSuggestions = 5,
                                                           mode,
                                                           onFilter,
                                                           onChange,
                                                         }) => {
  const [inputValue, setInputValue] = useState('');
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>(suggestions);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    const filtered = onFilter(value).slice(0, maxSuggestions);
    setFilteredSuggestions(filtered);

    // If mode is 'free', call onChange with the current input value
    if (mode === 'free') {
      onChange(value);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    setFilteredSuggestions([]);
    onChange(suggestion);
  };

  return (
    <Form>
      <FormControl
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        placeholder="Type something..."
      />
      {filteredSuggestions.length > 0 && (
        <ListGroup>
          {filteredSuggestions.map((suggestion, index) => (
            <ListGroup.Item
              key={index}
              action
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion}
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
    </Form>
  );
};

export default SuggestiveInput;
