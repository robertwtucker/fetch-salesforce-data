/**
 * Copyright (c) 2023 Quadient Group AG
 * SPDX-License-Identifier: MIT
 */

export function getDescription(): ScriptDescription {
  return {
    description:
      'Evolve script for integration with Salesforce.com. Fetches an arbitrary set of data (JSON format) using the Salesforce.com APIs.',
    icon: 'script',
    input: [
      {
        id: 'salesforceConnector',
        displayName: 'salesforceConnector',
        description:
          "The Evolve connector (web endpoint) configured with the Salesforce instance's host URL.",
        type: 'Connector',
        required: true,
      },
      {
        id: 'salesforceEndpointUrl',
        displayName: 'salesforceEndpointUrl',
        description: 'The Salesforce API endpoint URL.',
        type: 'String',
        defaultValue: '/services/data/v54.0/sobjects/',
        required: true,
      },
      {
        id: 'targetDataPath',
        displayName: 'targetDataPath',
        description: 'The output file to write the data retrieved (JSON) in.',
        type: 'OutputResource',
        required: true,
      },
    ],
    output: [],
  }
}

export async function execute(context: Context): Promise<void> {
  const url = prepareUrl(
    context.parameters.salesforceConnector as string,
    context.parameters.salesforceEndpointUrl as string
  )
  const data = await getSalesforceData(url)
  await saveDataToFile(
    context,
    data,
    context.parameters.targetDataPath as string
  )
}

/**
 * A helper function to prepare the URL for the Salesforce API call.
 *
 * @param host The host configured in the web endpoint connector
 * @param endpointUrl The endpoint URL supplied in the input parameters
 * @returns A fully formed URL with extra slashes stripped
 */
function prepareUrl(host: string, endpointUrl: string): string {
  return `${host}${endpointUrl.replace(/^\//, '')}`
}

/**
 * Call the Salesforce API and return the JSON data (as a string).
 *
 * @param url The Salesforce API endpoint URL
 * @returns A string containing the JSON data
 */
async function getSalesforceData(url: string): Promise<string> {
  const headers = new Headers()
  headers.append('Accept', 'application/json')

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: headers,
    })

    if (!response.ok) {
      throw new Error(
        `Non-OK API response from Salesforce: ${response.status} ${response.statusText}: ${response.body}`
      )
    }

    return await response.text()
  } catch (err) {
    throw new Error(`Unable to retrieve data from Salesforce: ${err}`)
  }
}

/**
 * Saves the data retrieved from the Salesforce API call to a file.
 *
 * @param context The Evolve context
 * @param data A string containing the JSON data to be written to the file
 * @param path The path to the output file to write the data
 */
async function saveDataToFile(
  context: Context,
  data: string,
  path: string
): Promise<void> {
  const outputFile = context.getFile(path)
  await outputFile.write(data)
  console.log(`Wrote response data to ${path}`)
}
