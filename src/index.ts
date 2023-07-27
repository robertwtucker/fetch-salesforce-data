/**
 * Copyright (c) 2023 Quadient Group AG
 * SPDX-License-Identifier: MIT
 */

import { StringReadableStream } from '@quadient/evolve-data-transformations'

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
  // Call the Salesforce API
  //
  const url = prepareUrl(
    context.parameters.salesforceConnector as string,
    context.parameters.salesforceEndpointUrl as string
  )
  const headers = new Headers()
  headers.append('Accept', 'application/json')

  const response = await fetch(url, {
    method: 'GET',
    headers: headers,
  })

  const json = await response.json()
  if (!response.ok) {
    throw new Error(
      `Non-OK API response: ${response.status} ${
        response.statusText
      }: ${JSON.stringify(json, null, 2)}`
    )
  }

  // Write the response data to the output file specified in the
  // `targetDataPath` parameter.
  //
  const inputStream = new StringReadableStream(JSON.stringify(json))
  const outputStream = await context.openWriteText(
    context.parameters.targetDataPath as string
  )

  console.log(`Writing response data to ${context.parameters.targetDataPath}`)
  await inputStream.pipeTo(outputStream)
}

/**
 * A helper function to prepare the URL for the Salesforce API call
 *
 * @param host The host configured in the web endpoint connector
 * @param endpointUrl The endpoint URL supplied in the input parameters
 * @returns A fully formed URL with extra slashes stripped
 */
function prepareUrl(host: string, endpointUrl: string): string {
  return `${host}${endpointUrl.replace(/^\//, '')}`
}
