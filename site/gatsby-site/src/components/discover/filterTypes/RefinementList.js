import React, { useCallback } from 'react';
import styled from 'styled-components';
import { connectRefinementList, Highlight } from 'react-instantsearch-dom';
import { Form, Badge, ListGroup, Button } from 'react-bootstrap';
import useSearch from '../useSearch';

const ListGroupScrollable = styled(ListGroup)`
  max-height: 400px;
  overflow-y: scroll;
`;

const RefinementList = ({
  items,
  isFromSearch,
  refine,
  searchForItems,
  placeholder,
  attribute,
}) => {
  const clear = useCallback(() => {
    refine([]);
  }, [items]);

  const { searchState } = useSearch();

  const selectedItems = searchState.refinementList[attribute] || [];

  const clearEnabled = selectedItems.length > 0;

  return (
    <>
      <Form onSubmit={(e) => e.preventDefault()}>
        <Form.Control
          type="search"
          placeholder={placeholder}
          onChange={(event) => searchForItems(event.currentTarget.value)}
        />
      </Form>
      <ListGroupScrollable className="mt-4 border">
        {items.map((item) => (
          <ListGroup.Item
            action
            key={item.label}
            active={item.isRefined}
            onClick={() => {
              refine(item.value);
            }}
          >
            <div className="d-flex justify-content-between align-items-center">
              {isFromSearch ? <Highlight attribute="label" hit={item} /> : item.label}&nbsp;
              <Badge bg="secondary">{item.count}</Badge>
            </div>
          </ListGroup.Item>
        ))}

        {items.length === 0 && (
          <ListGroup.Item key="no-results">
            <div className="d-flex justify-content-center">No result</div>
          </ListGroup.Item>
        )}
      </ListGroupScrollable>
      <Button
        variant="link secondary"
        className="mt-4 text-decoration-none"
        onClick={clear}
        disabled={!clearEnabled}
      >
        Clear
      </Button>
    </>
  );
};

export const touchedCount = ({ searchState, attribute }) =>
  searchState.refinementList[attribute] ? searchState.refinementList[attribute].length : 0;

export default connectRefinementList(RefinementList);
