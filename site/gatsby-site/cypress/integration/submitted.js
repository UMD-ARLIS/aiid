import { maybeIt } from '../support/utils';
import submittedReports from '../fixtures/submissions/submitted.json';
import { format, getUnixTime } from 'date-fns';

describe('Submitted reports', () => {
  const url = '/apps/submitted';

  it('Loads submitted reports', () => {
    cy.conditionalIntercept(
      '**/graphql',
      (req) => req.body.operationName == 'FindSubmissions',
      'FindSubmission',
      submittedReports
    );

    cy.visit(url);

    cy.wait('@FindSubmission');

    const submissions = submittedReports.data.submissions;

    cy.get('[data-cy="submissions"] > div').should('have.length', submissions.length);

    submissions.forEach((report, index) => {
      cy.get('[data-cy="submissions"]')
        .children(`:nth-child(${index + 1})`)
        .contains('review >')
        .click();

      cy.get('[data-cy="submissions"]')
        .children(`:nth-child(${index + 1})`)
        .within(() => {
          cy.get('[data-cy="source_domain"]').should('contain', report.source_domain);
          cy.get('[data-cy="authors"]').should('contain', report.authors);
          cy.get('[data-cy="submitters"]').should('contain', report.submitters);
          cy.get('[data-cy="incident_id"]').should('contain', report.incident_id);
          cy.get('[data-cy="date_published"]').should('contain', report.date_published);
          cy.get('[data-cy="date_submitted"]').should('contain', report.date_submitted);
          cy.get('[data-cy="date_downloaded"]').should('contain', report.date_downloaded);
          cy.get('[data-cy="date_modified"]').should('contain', report.date_modified);
          cy.get('[data-cy="url"]').should('contain', report.url);
        });
    });
  });

  maybeIt('Promotes a report and links it to a new incident', () => {
    cy.login(Cypress.env('e2eUsername'), Cypress.env('e2ePassword'));

    const submission = submittedReports.data.submissions.find((r) => r.incident_id === '0');

    cy.conditionalIntercept(
      '**/graphql',
      (req) => req.body.operationName == 'FindSubmissions',
      'FindSubmissions',
      {
        data: {
          submissions: [submission],
        },
      }
    );

    cy.visit(url);

    cy.wait('@FindSubmissions');

    cy.get('[data-cy="submissions"] > div:nth-child(1)').as('promoteForm');

    cy.get('@promoteForm').contains('review >').click();

    cy.conditionalIntercept(
      '**/graphql',
      (req) => req.body.operationName == 'PromoteSubmission',
      'promoteSubmission',
      {
        data: {
          promoteSubmissionToReport: [
            {
              __typename: 'Incident',
              incident_id: 182,
              reports: [
                {
                  __typename: 'Report',
                  report_number: 1565,
                  ref_number: 1,
                },
              ],
            },
          ],
        },
      }
    );

    cy.conditionalIntercept(
      '**/graphql',
      (req) => req.body.operationName == 'UpdateReport',
      'updateReport',
      {
        data: {
          updateOneReport: {
            ...submission,
            __typename: 'Report',
            report_number: 1565,
          },
        },
      }
    );

    cy.conditionalIntercept(
      '**/graphql',
      (req) => req.body.operationName == 'UpdateIncident',
      'updateIncident',
      {
        data: {
          updateOneIncident: {
            __typename: 'Incident',
            incident_id: 182,
            reports: [
              {
                __typename: 'Report',
                report_number: 1565,
              },
            ],
          },
        },
      }
    );

    cy.get('@promoteForm').contains('button', 'Add New Incident').click();

    cy.wait('@promoteSubmission')
      .its('request.body.variables.input')
      .then((input) => {
        expect(input.incident_ids).to.deep.eq([]);
        expect(input.submission_id).to.eq('5f9c3ebfd4896d392493f03c');
      });

    cy.wait('@updateReport')
      .its('request.body.variables')
      .then(({ set, query }) => {
        expect(query.report_number).eq(1565);

        expect(set.incident_id).eq(182);
        expect(set.text).eq(submission.text);
        expect(set.title).eq(submission.title);
        expect(set.authors).deep.eq(submission.authors);
        expect(set.submitters).deep.eq(submission.submitters);
        expect(set.source_domain).eq(submission.source_domain);
        expect(set.url).eq(submission.url);
        expect(set.cloudinary_id).eq(submission.cloudinary_id);
        expect(set.image_url).eq(submission.image_url);

        const date_modified = format(new Date(), 'yyyy-MM-dd');

        const epoch_date_modified = getUnixTime(new Date(date_modified));

        expect(set.date_modified).eq(date_modified);
        expect(set.date_downloaded).eq('2020-10-30');
        expect(set.date_published).eq('2017-05-03');
        expect(set.date_submitted).eq('2020-10-30');

        expect(set.epoch_date_modified).eq(epoch_date_modified);
        expect(set.epoch_date_downloaded).eq(1604016000);
        expect(set.epoch_date_published).eq(1493769600);
        expect(set.epoch_date_submitted).eq(1604016000);
      });

    cy.wait('@updateIncident')
      .its('request.body.variables')
      .then(({ query, set }) => {
        expect(query.incident_id).eq(182);
        expect(set.title).eq(submission.title);
        expect(set.date).eq(submission.incident_date);
        expect(set.description).eq('');
        expect(set.AllegedDeployerOfAISystem).to.deep.eq([]);
        expect(set.AllegedDeveloperOfAISystem).to.deep.eq([]);
        expect(set.AllegedHarmedOrNearlyHarmedParties).to.deep.eq([]);
      });

    cy.get('[data-cy="toast"]')
      .contains('Successfully promoted submission to Incident 182 and Report 1565')
      .should('exist');
  });

  maybeIt('Promotes a report and links it to an existing incident', () => {
    cy.login(Cypress.env('e2eUsername'), Cypress.env('e2ePassword'));

    const submission = submittedReports.data.submissions.find((r) => r.incident_id === '10');

    cy.conditionalIntercept(
      '**/graphql',
      (req) => req.body.operationName == 'FindSubmissions',
      'FindSubmissions',
      {
        data: {
          submissions: [submission],
        },
      }
    );

    cy.visit(url);

    cy.wait('@FindSubmissions');

    cy.get('[data-cy="submissions"] > div:nth-child(1)').as('promoteForm');

    cy.get('@promoteForm').contains('review >').click();

    cy.conditionalIntercept(
      '**/graphql',
      (req) => req.body.operationName == 'PromoteSubmission',
      'promoteSubmission',
      {
        data: {
          promoteSubmissionToReport: [
            {
              __typename: 'Incident',
              incident_id: 10,
              reports: [
                {
                  __typename: 'Report',
                  report_number: 1565,
                  ref_number: 1,
                },
                {
                  __typename: 'Report',
                  report_number: 1566,
                  ref_number: 2,
                },
              ],
            },
          ],
        },
      }
    );

    cy.conditionalIntercept(
      '**/graphql',
      (req) => req.body.operationName == 'UpdateReport',
      'updateReport',
      {
        data: {
          updateOneReport: {
            ...submission,
            __typename: 'Report',
            report_number: 1566,
            ref_number: 2,
          },
        },
      }
    );

    cy.get('@promoteForm').contains('button', 'Add New Report').click();

    cy.wait('@promoteSubmission')
      .its('request.body.variables.input')
      .then((input) => {
        expect(input.incident_ids).to.deep.eq(['10']);
        expect(input.submission_id).to.eq('6123bf345e740c1a81850e89');
      });

    cy.wait('@updateReport')
      .its('request.body.variables')
      .then(({ set, query }) => {
        expect(query.report_number).eq(1566);

        expect(set.incident_id).eq(10);
        expect(set.text).eq(submission.text);
        expect(set.title).eq(submission.title);
        expect(set.authors).deep.eq(submission.authors);
        expect(set.submitters).deep.eq(submission.submitters);
        expect(set.source_domain).eq(submission.source_domain);
        expect(set.url).eq(submission.url);
        expect(set.cloudinary_id).eq(submission.cloudinary_id);
        expect(set.image_url).eq(submission.image_url);

        const date_modified = format(new Date(), 'yyyy-MM-dd');

        const epoch_date_modified = getUnixTime(new Date(date_modified));

        expect(set.date_modified).eq(date_modified);

        expect(set.date_downloaded).eq('2021-08-23');
        expect(set.date_published).eq('2019-07-18');
        expect(set.date_submitted).eq('2021-08-23');

        expect(set.epoch_date_modified).eq(epoch_date_modified);
        expect(set.epoch_date_downloaded).eq(1629676800);
        expect(set.epoch_date_published).eq(1563408000);
        expect(set.epoch_date_submitted).eq(1629676800);
      });

    cy.get('[data-cy="toast"]')
      .contains('Successfully promoted submission to Incident 10 and Report 1566')
      .should('exist');
  });
});
