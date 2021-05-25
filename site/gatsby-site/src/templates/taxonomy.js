import React, { useState } from 'react';
import styled from 'styled-components';
import md5 from 'md5';
import Markdown from 'react-markdown';
import Badge from 'react-bootstrap/Badge';

import Layout from 'components/Layout';
import { StyledHeading } from 'components/styles/Docs';
import Link from 'components/Link';

const Row = styled.div`
  display: flex;
  flex-direction: row;
`;

const Description = styled(Markdown)`
  h1 {
    font-size: 26px;
    font-weight: 800;
    line-height: 1.5;
    margin-bottom: 16px;
    margin-top: 32px;
  }
  p {
    line-height: 1.5;
  }
`;

const Card = styled.div`
  border: 1.5px solid #d9deee;
  border-radius: 5px;
  box-shadow: 0 2px 5px 0px #e3e5ec;
  display: flex;
  flex-direction: column;
  padding: 1em 2em 2em 2em;
  margin-bottom: 2em;
  width: 100%;
`;

const FieldNameHeading = styled.h1`
  font-size: 20px;
  font-weight: 800;
  line-height: 1.5;
  margin-bottom: 0.5em;
`;

const StyledLi = styled.li`
  margin-left: 1em;
`;

const StyledButton = styled.button`
  margin-top: 1em;
`;

const FacetList = ({ namespace, instant_facet, short_name, permitted_values, stats }) => {
  if (!instant_facet) {
    return '';
  }

  let valueStats = {};

  if (stats[short_name]) {
    valueStats = stats[short_name];
  }

  const [showAllStats, setShowAllStats] = useState(false);

  const toggleShowAllStats = () => {
    setShowAllStats(!showAllStats);
  };

  if (permitted_values) {
    return (
      <div>
        <ul>
          {permitted_values
            .filter((item, index) => showAllStats || index < 5)
            .map((item) => (
              <StyledLi key={`${short_name}-${item}`}>
                <Link
                  to={
                    `/apps/discover?classifications=` +
                    encodeURIComponent(`${namespace}:${short_name}:${item}`)
                  }
                >
                  {valueStats !== {} ? (
                    <>
                      {`${item} => ${valueStats[item] || 0} ${
                        valueStats[item] === 1 ? 'Incident' : 'Incidents'
                      }`}
                    </>
                  ) : (
                    <>{`${item}`}</>
                  )}
                </Link>
              </StyledLi>
            ))}
          {permitted_values.length > 5 && (
            <StyledButton
              onClick={toggleShowAllStats}
              type="button"
              className="btn btn-secondary btn-sm assignment-button"
            >
              {`Show ${showAllStats ? 'less stats' : 'more stats'}`}
            </StyledButton>
          )}
        </ul>
      </div>
    );
  }

  if (valueStats && Object.keys(valueStats).length !== 0) {
    const valueStatsKeys = Object.keys(valueStats);

    return (
      <div>
        <ul>
          {valueStatsKeys
            .filter((item, index) => showAllStats || index < 5)
            .map((item) => (
              <StyledLi key={`${short_name}-${item}`}>
                <Link
                  to={
                    `/apps/discover?classifications=` +
                    encodeURIComponent(`${namespace}:${short_name}:${item}`)
                  }
                >
                  {valueStats !== {} ? (
                    <>
                      {`${item} => ${valueStats[item] || 0} ${
                        valueStats[item] === 1 ? 'Incident' : 'Incidents'
                      }`}
                    </>
                  ) : (
                    <>{`${item}`}</>
                  )}
                </Link>
              </StyledLi>
            ))}
        </ul>
        {valueStatsKeys.length > 5 && (
          <StyledButton
            onClick={toggleShowAllStats}
            type="button"
            className="btn btn-secondary btn-sm assignment-button"
          >
            {`Show ${showAllStats ? 'less stats' : 'more stats'}`}
          </StyledButton>
        )}
      </div>
    );
  }

  return <></>;
};

const Taxonomy = (props) => {
  if (!props || !props.pageContext) {
    return null;
  }

  const { namespace, description, field_list } = props.pageContext.taxonomy;

  const sortedFieldsArray = field_list.sort((a, b) => b.weight - a.weight);

  return (
    <Layout {...props}>
      <div className={'titleWrapper'}>
        <StyledHeading>{namespace}</StyledHeading>
      </div>
      <Description>{description}</Description>
      <h1 className="heading1">Taxonomy Fields</h1>
      {sortedFieldsArray.map(
        ({ long_name, long_description, permitted_values, short_name, instant_facet }) => (
          <Row key={md5(long_name)}>
            <Card>
              <FieldNameHeading>
                {long_name}{' '}
                {instant_facet && <Badge variant="secondary">Searchable in Facet</Badge>}
              </FieldNameHeading>
              <Description>{long_description}</Description>
              <FacetList
                namespace={namespace}
                instant_facet={instant_facet}
                short_name={short_name}
                permitted_values={permitted_values}
                stats={props.pageContext.stats}
              />
            </Card>
          </Row>
        )
      )}
    </Layout>
  );
};

export default Taxonomy;
