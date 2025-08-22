import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import HeaderRight from '../HeaderRight/HeaderRight';
import './OfflineInspectionForm.css';



const OfflineInspectionForm = () => {

  return (
		<div className="dashboard create-rfi inspection-form">
			<HeaderRight />
			<div className="right">
				<div className="dashboard-main">
					<div className="rfi-inspection-form">
            <h2>RFI Offline Inspection </h2>
							<div className="form-step">
								<h3>Enclosures</h3>
								
                <table className="enclosure-table">
									<thead>
										<tr><th>RFI Description</th><th>Enclosure</th><th>Action</th>
											<th>Uploaded</th>
											<th>Other</th></tr>
									</thead>
									<tbody>
										
												<tr >
													<td>1</td>
													<td>enclosure</td>

													<td>
														<button >Open</button>{' '}
														<button >Edit</button>
														
															<button >Upload</button>
												
													</td>



													<td>
															<button
																onClick={() => {
																	const link = document.createElement('a');
																	
																	document.body.appendChild(link);
																	link.click();
																	document.body.removeChild(link);
																}}
																style={{ padding: '4px 10px', cursor: 'pointer' }}
															>
																Download Enclosure
															</button>
														
													</td>

														<td >
																<button
																	onClick={() => {
																		const link = document.createElement('a');
																		
																		document.body.appendChild(link);
																		link.click();
																		document.body.removeChild(link);
																	}}
																>
																	Download Test Report
																</button>
														</td>
												</tr>
                        <tr >
													<td>2</td>
													<td>enclosure</td>

													<td>
														<button >Open</button>{' '}
														<button >Edit</button>
														
															<button >Upload</button>
												
													</td>



													<td>
															<button
																onClick={() => {
																	const link = document.createElement('a');
																	
																	document.body.appendChild(link);
																	link.click();
																	document.body.removeChild(link);
																}}
																style={{ padding: '4px 10px', cursor: 'pointer' }}
															>
																Download Enclosure
															</button>
														
													</td>

														<td >
																<button
																	onClick={() => {
																		const link = document.createElement('a');
																		
																		document.body.appendChild(link);
																		link.click();
																		document.body.removeChild(link);
																	}}
																>
																	Download Test Report
																</button>
														</td>
												</tr>
											
									</tbody>
								</table>

								
							</div>
					</div>
				</div>
			</div>
		</div>
	);
}





export default OfflineInspectionForm;
