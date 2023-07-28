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
        id: 'salesforceEndpoint',
        displayName: 'Salesforce endpoint',
        description:
          "The web endpoint connector configured with the appropriate Salesforce instance's host and endpoint URL.",
        type: 'Connector',
        defaultValue: 'services/data/v54.0/sobjects/',
        required: true,
      },
      {
        id: 'outputDataFile',
        displayName: 'Output data file',
        description: 'The output file to write the data retrieved (JSON) in.',
        type: 'OutputResource',
        required: true,
      },
    ],
    output: [],
  }
}

export async function execute(context: Context): Promise<void> {
  const url = context.parameters.salesforceEndpoint as string
  const data = await getSalesforceData(url)
  await saveDataToFile(
    context,
    data,
    context.parameters.outputDataFile as string
  )
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
